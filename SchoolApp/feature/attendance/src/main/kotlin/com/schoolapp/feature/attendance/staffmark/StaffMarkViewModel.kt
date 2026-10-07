package com.schoolapp.feature.attendance.staffmark

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.attendance.StaffAttendanceRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.organisation.BranchOption
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Staff register for one branch and day (web "Staff attendance" tab). Branch-bound roles use their
 * branch; global roles pick from `/branches`. Changing branch or date drops unsaved edits, like web.
 */
@HiltViewModel
class StaffMarkViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: StaffAttendanceRepository,
    private val organisationRepository: OrganisationRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate().toString()
    private val _uiState = MutableStateFlow(StaffMarkUiState(date = today, today = today))
    val uiState: StateFlow<StaffMarkUiState> = _uiState.asStateFlow()

    private var started = false
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canMark = session.has(MARK_PERMISSION)) }
        }
    }

    /** Loads on first show of the tab; nothing is fetched for roles that never open it. */
    fun start() {
        if (started) return
        started = true
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            if (!session.has(MARK_PERMISSION)) return@launch
            val own = session.activeBranchId
            if (own != null) {
                _uiState.update { it.copy(branchId = own) }
            } else {
                when (val result = organisationRepository.branches()) {
                    is AppResult.Failure -> {
                        started = false
                        _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                        return@launch
                    }
                    is AppResult.Success -> {
                        val options = result.data.map { BranchOption(it.id, it.name, it.schoolId) }
                        _uiState.update { it.copy(branches = options, branchId = options.firstOrNull()?.id) }
                    }
                }
            }
            fetch()
        }
    }

    fun retry() {
        if (_uiState.value.branchId == null) {
            _uiState.update { it.copy(isLoading = true, error = null) }
            started = false
            start()
        } else {
            load()
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        if (_uiState.value.branchId == null) retry() else load()
    }

    fun onBranchSelected(branchId: String) {
        if (branchId == _uiState.value.branchId) return
        _uiState.update { it.copy(branchId = branchId).reset() }
        load()
    }

    fun onDateSelected(date: String) {
        if (date > today || date == _uiState.value.date) return
        _uiState.update { it.copy(date = date).reset() }
        load()
    }

    fun onStatusSelected(staffId: String, status: AttendanceStatus) = edit(staffId) { current ->
        if (status in StaffRowUi.NO_TIMES) {
            current.copy(status = status, checkIn = null, checkOut = null, timesCleared = true)
        } else {
            current.copy(status = status)
        }
    }

    /** Marks everyone still unmarked as present; existing marks are kept. */
    fun markAllPresent() {
        val unmarked = _uiState.value.rows.filter { it.status == null }.map { it.staffId }
        if (unmarked.isEmpty()) return
        _uiState.update { state ->
            val edits = state.edits.toMutableMap()
            unmarked.forEach { id -> edits[id] = (edits[id] ?: StaffEdit()).copy(status = AttendanceStatus.PRESENT) }
            state.copy(edits = edits, message = null, actionError = null)
        }
    }

    fun openDetails(staffId: String) = _uiState.update { it.copy(detailsFor = staffId) }

    fun closeDetails() = _uiState.update { it.copy(detailsFor = null) }

    fun onCheckInChange(staffId: String, time: String) = edit(staffId) { it.copy(checkIn = time) }

    fun onCheckOutChange(staffId: String, time: String) = edit(staffId) { it.copy(checkOut = time) }

    fun clearTimes(staffId: String) = edit(staffId) { it.copy(checkIn = null, checkOut = null, timesCleared = true) }

    fun onRemarkChange(staffId: String, remark: String) = edit(staffId) { it.copy(remark = remark.take(REMARK_MAX)) }

    fun dismissMessage() = _uiState.update { it.copy(message = null, actionError = null) }

    fun save() {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        if (!state.dirty || state.isSaving) return
        val date = state.date
        _uiState.update { it.copy(isSaving = true, actionError = null, message = null) }
        viewModelScope.launch {
            when (val result = repository.save(branchId, date, state.marksToSave)) {
                is AppResult.Success -> _uiState.update {
                    if (it.branchId != branchId || it.date != date) {
                        it.copy(isSaving = false, message = StaffMarkMessage.SAVED)
                    } else {
                        it.copy(isSaving = false, entries = result.data.entries, edits = emptyMap(), message = StaffMarkMessage.SAVED)
                    }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, actionError = result.error) }
            }
        }
    }

    private fun load() {
        _uiState.update { it.copy(isLoading = it.entries.isEmpty() && !it.isRefreshing, error = null) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch { fetch() }
    }

    private suspend fun fetch() {
        val state = _uiState.value
        val branchId = state.branchId
        if (branchId == null) {
            _uiState.update { it.copy(isLoading = false, isRefreshing = false) }
            return
        }
        when (val result = repository.sheet(branchId, state.date)) {
            is AppResult.Success -> _uiState.update {
                it.copy(isLoading = false, isRefreshing = false, error = null, entries = result.data.entries)
            }
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
        }
    }

    private fun edit(staffId: String, change: (StaffEdit) -> StaffEdit) = _uiState.update { state ->
        val next = change(state.edits[staffId] ?: StaffEdit())
        state.copy(edits = state.edits + (staffId to next), message = null, actionError = null)
    }

    private fun StaffMarkUiState.reset() = copy(
        entries = emptyList(),
        edits = emptyMap(),
        isLoading = true,
        error = null,
        message = null,
        actionError = null,
        detailsFor = null,
    )

    internal companion object {
        /** Same gate as the web Staff attendance tab and `PUT /staff-attendance`. */
        const val MARK_PERMISSION = "attendance.approve"
        const val REMARK_MAX = 300
    }
}

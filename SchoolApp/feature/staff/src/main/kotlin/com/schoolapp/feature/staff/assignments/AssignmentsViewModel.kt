package com.schoolapp.feature.staff.assignments

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.staff.assignments.StaffAssignmentsRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.feature.staff.common.StaffEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Assignments tab: session picker, current assignments, end one; the add sheet lives in [AddAssignmentController]. */
@HiltViewModel
class AssignmentsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffAssignmentsRepository,
    private val organisation: OrganisationRepository,
    private val events: StaffEvents,
    val addController: AddAssignmentController,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }
    private var branchId: String? = null
    private var bound = false

    private val _uiState = MutableStateFlow(AssignmentsUiState())
    val uiState: StateFlow<AssignmentsUiState> = _uiState.asStateFlow()

    /** Called once the staff record (and so its branch) is known. */
    fun bind(branchId: String?) {
        if (bound && this.branchId == branchId) return
        bound = true
        this.branchId = branchId
        addController.attach(viewModelScope, staffId, _uiState) { onAdded() }
        loadSessions()
    }

    fun retry() = if (_uiState.value.hasSessions) loadAssignments(refresh = false) else loadSessions()

    fun refresh() = loadAssignments(refresh = true)

    private fun loadSessions() {
        val branch = branchId ?: return _uiState.update { it.copy(isLoading = false) }
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = organisation.sessions(branch)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val sessions = result.data
                    val chosen = (sessions.firstOrNull { it.isActive } ?: sessions.firstOrNull())?.id
                    val options = sessions.map { SwitcherOption(it.id, it.name, it.status?.takeIf { s -> s != "ACTIVE" }) }
                    _uiState.update { it.copy(sessions = options, sessionId = chosen) }
                    if (chosen == null) _uiState.update { it.copy(isLoading = false) } else loadAssignments(refresh = false)
                }
            }
        }
    }

    fun selectSession(id: String) {
        if (id == _uiState.value.sessionId) return
        _uiState.update { it.copy(sessionId = id, assignments = emptyList()) }
        loadAssignments(refresh = false)
    }

    private fun loadAssignments(refresh: Boolean) {
        val session = _uiState.value.sessionId ?: return _uiState.update { it.copy(isRefreshing = false) }
        _uiState.update { if (refresh) it.copy(isRefreshing = true) else it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val result = repository.assignments(staffId, session)
            if (_uiState.value.sessionId != session) return@launch
            _uiState.update {
                when (result) {
                    is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error.takeIf { _ -> !refresh || it.assignments.isEmpty() })
                    is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, error = null, assignments = result.data)
                }
            }
        }
    }

    fun askEnd(assignment: StaffAssignment) = _uiState.update { it.copy(endTarget = assignment, endError = null) }

    fun dismissEnd() = _uiState.update { if (it.isEnding) it else it.copy(endTarget = null, endError = null) }

    fun confirmEnd() {
        val target = _uiState.value.endTarget ?: return
        if (_uiState.value.isEnding) return
        _uiState.update { it.copy(isEnding = true, endError = null) }
        viewModelScope.launch {
            when (val result = repository.end(staffId, target.id)) {
                is AppResult.Failure -> _uiState.update { it.copy(isEnding = false, endError = result.error) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(isEnding = false, endTarget = null, notice = AssignmentNotice.ENDED) }
                    loadAssignments(refresh = true)
                    events.changed()
                }
            }
        }
    }

    fun openAdd() {
        val branch = branchId ?: return
        addController.open(branch, _uiState.value.sessionId)
    }

    fun consumeNotice() = _uiState.update { it.copy(notice = null) }

    private fun onAdded() {
        _uiState.update { it.copy(notice = AssignmentNotice.ADDED) }
        loadAssignments(refresh = true)
        events.changed()
    }
}

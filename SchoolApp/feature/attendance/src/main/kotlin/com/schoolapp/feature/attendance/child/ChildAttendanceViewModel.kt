package com.schoolapp.feature.attendance.child

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.feature.attendance.leave.MyLeavesController
import com.schoolapp.feature.attendance.leave.MyLeavesState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/** Parent: the active child's month of attendance and the parent's leave requests for that child. */
@HiltViewModel
class ChildAttendanceViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: AttendanceRepository,
    leaveRepository: LeaveRepository,
    filesRepository: FilesRepository,
    clock: AppClock,
) : ViewModel() {

    private val todayDate = clock.now().toLocalDate()
    private val _uiState = MutableStateFlow(
        ChildAttendanceUiState(month = YearMonth.from(todayDate), currentMonth = YearMonth.from(todayDate), today = todayDate.toString()),
    )
    val uiState: StateFlow<ChildAttendanceUiState> = _uiState.asStateFlow()

    val leaves = MyLeavesController(
        repository = leaveRepository,
        scope = viewModelScope,
        withType = false,
        defaultDate = { todayDate.toString() },
        inputFor = { form ->
            _uiState.value.childId?.let {
                LeaveInput.ForStudent(it, form.from, form.to, form.reason.trim(), form.attachments.fileIds.firstOrNull())
            }
        },
        include = { leave -> leave.subject.id == null || leave.subject.id == _uiState.value.childId },
        files = filesRepository,
    )
    val leavesState: StateFlow<MyLeavesState> = leaves.state

    private var historyJob: Job? = null

    init {
        viewModelScope.launch { leaves.load() }
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild }
                .distinctUntilChanged()
                .collectLatest { child ->
                    _uiState.update { it.copy(childId = child?.id, childName = child?.fullName, history = null) }
                    leaves.refilter()
                    loadHistory()
                }
        }
    }

    fun onPreviousMonth() = changeMonth(_uiState.value.month.minusMonths(1))

    fun onNextMonth() {
        if (_uiState.value.canGoNext) changeMonth(_uiState.value.month.plusMonths(1))
    }

    fun retry() {
        historyJob?.cancel()
        historyJob = viewModelScope.launch { loadHistory() }
        leaves.refresh()
    }

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, history = null) }
        historyJob?.cancel()
        historyJob = viewModelScope.launch { loadHistory() }
    }

    private suspend fun loadHistory() {
        val state = _uiState.value
        val childId = state.childId
        if (childId == null) {
            _uiState.update { it.copy(isLoading = false, error = null) }
            return
        }
        _uiState.update { it.copy(isLoading = true, error = null) }
        val from = state.month.atDay(1)
        val to = minOf(state.month.atEndOfMonth(), todayDate)
        val result = repository.studentHistory(childId, from.toString(), to.toString())
        _uiState.update { current ->
            if (current.childId != childId || current.month != state.month) return@update current
            when (result) {
                is AppResult.Success -> current.copy(isLoading = false, history = result.data)
                is AppResult.Failure -> current.copy(isLoading = false, error = result.error)
            }
        }
    }
}

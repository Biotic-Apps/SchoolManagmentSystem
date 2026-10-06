package com.schoolapp.feature.attendance.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveType
import com.schoolapp.feature.attendance.leave.MyLeavesController
import com.schoolapp.feature.attendance.leave.MyLeavesState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/** Staff self-service: own attendance by month and own leave requests. */
@HiltViewModel
class MyAttendanceViewModel @Inject constructor(
    private val repository: AttendanceRepository,
    leaveRepository: LeaveRepository,
    clock: AppClock,
) : ViewModel() {

    private val todayDate = clock.now().toLocalDate()
    private val _uiState = MutableStateFlow(MyAttendanceUiState(month = YearMonth.from(todayDate), currentMonth = YearMonth.from(todayDate)))
    val uiState: StateFlow<MyAttendanceUiState> = _uiState.asStateFlow()

    val leaves = MyLeavesController(
        repository = leaveRepository,
        scope = viewModelScope,
        withType = true,
        defaultDate = { todayDate.toString() },
        inputFor = { form -> LeaveInput.ForSelf(form.type ?: LeaveType.CASUAL, form.from, form.to, form.reason.trim()) },
    )
    val leavesState: StateFlow<MyLeavesState> = leaves.state

    private var loadJob: Job? = null

    init {
        load()
        leaves.refresh()
    }

    fun onPreviousMonth() = changeMonth(_uiState.value.month.minusMonths(1))

    fun onNextMonth() {
        if (_uiState.value.canGoNext) changeMonth(_uiState.value.month.plusMonths(1))
    }

    fun retry() {
        load()
        leaves.refresh()
    }

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, attendance = null) }
        load()
    }

    private fun load() {
        val month = _uiState.value.month
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val to = minOf(month.atEndOfMonth(), todayDate)
            when (val result = repository.myStaffAttendance(month.atDay(1).toString(), to.toString())) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, attendance = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }
}

package com.schoolapp.feature.students.detail.attendance

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.model.attendance.StudentAttendance
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

@Immutable
internal data class StudentAttendanceUiState(
    val month: YearMonth,
    val currentMonth: YearMonth,
    val today: String,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val history: StudentAttendance? = null,
    val error: AppError? = null,
) {
    val canGoNext: Boolean get() = month < currentMonth
}

/** Attendance tab: one month of `GET /attendance/students/:id` (up to today), with month navigation. */
@HiltViewModel
internal class StudentAttendanceViewModel @Inject constructor(
    private val repository: AttendanceRepository,
    clock: AppClock,
) : ViewModel() {

    private val todayDate = clock.now().toLocalDate()
    private val _uiState = MutableStateFlow(
        StudentAttendanceUiState(YearMonth.from(todayDate), YearMonth.from(todayDate), todayDate.toString()),
    )
    val uiState: StateFlow<StudentAttendanceUiState> = _uiState.asStateFlow()

    private var studentId: String? = null
    private var job: Job? = null

    fun start(id: String) {
        if (studentId == id) return
        studentId = id
        load()
    }

    fun onPreviousMonth() = changeMonth(_uiState.value.month.minusMonths(1))

    fun onNextMonth() {
        if (_uiState.value.canGoNext) changeMonth(_uiState.value.month.plusMonths(1))
    }

    fun refresh() = load(refresh = true)

    fun load(refresh: Boolean = false) {
        val id = studentId ?: return
        val month = _uiState.value.month
        _uiState.update { it.copy(isLoading = !refresh && it.history == null, isRefreshing = refresh, error = null) }
        job?.cancel()
        job = viewModelScope.launch {
            val to = minOf(month.atEndOfMonth(), todayDate)
            val result = repository.studentHistory(id, month.atDay(1).toString(), to.toString())
            _uiState.update { state ->
                if (state.month != month) return@update state
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, history = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, history = null) }
        load()
    }
}

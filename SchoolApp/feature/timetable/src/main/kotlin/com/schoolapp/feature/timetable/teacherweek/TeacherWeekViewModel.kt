package com.schoolapp.feature.timetable.teacherweek

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.feature.timetable.DayPlanner
import com.schoolapp.feature.timetable.ScheduleRow
import com.schoolapp.feature.timetable.TimetableWeek
import com.schoolapp.feature.timetable.WeekDates
import com.schoolapp.feature.timetable.scope.TimetableBranchScope
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

/** Supervisors look up any teacher's week (published lessons + substitute periods), week by week. */
@HiltViewModel
class TeacherWeekViewModel @Inject internal constructor(
    private val authRepository: AuthRepository,
    private val scope: TimetableBranchScope,
    private val allocation: TeacherAllocationRepository,
    private val loader: TeacherWeekLoader,
    private val clock: AppClock,
) : ViewModel() {

    private val thisWeek = WeekDates.forToday(clock.now().toLocalDate())
    private val _uiState = MutableStateFlow(TeacherWeekUiState(monday = thisWeek.monday, thisMonday = thisWeek.monday))
    val uiState: StateFlow<TeacherWeekUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    init {
        loadTeachers()
    }

    fun loadTeachers() {
        _uiState.update { it.copy(teachersLoading = true, teachersError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            branchId = (scope.branchId(session) as? AppResult.Success)?.data
            val branch = branchId
            if (branch == null) {
                _uiState.update { it.copy(teachersLoading = false) }
                return@launch
            }
            when (val result = allocation.teachingStaff(branch, null)) {
                is AppResult.Failure -> _uiState.update { it.copy(teachersLoading = false, teachersError = result.error) }
                is AppResult.Success -> _uiState.update { it.copy(teachersLoading = false, teachers = result.data) }
            }
        }
    }

    fun selectTeacher(staffId: String?) {
        if (staffId == null || staffId == _uiState.value.staffId) return
        _uiState.update { it.copy(staffId = staffId) }
        load(spinner = true)
    }

    /** -1 previous week, +1 next week, 0 back to this week. */
    fun moveWeek(step: Int) {
        val monday = if (step == 0) thisWeek.monday else (_uiState.value.monday ?: thisWeek.monday).plusWeeks(step.toLong())
        _uiState.update { it.copy(monday = monday) }
        load(spinner = true)
    }

    fun selectDay(day: Int) = _uiState.update { it.copy(timetable = it.timetable.copy(selectedDay = day)) }

    fun openLesson(row: ScheduleRow?) = _uiState.update { it.copy(timetable = it.timetable.copy(openLesson = row?.takeIf { r -> r.isLesson })) }

    fun retry() = load(spinner = true)

    fun refresh() = load(spinner = false)

    private fun load(spinner: Boolean) {
        val staffId = _uiState.value.staffId ?: return
        val week = WeekDates(_uiState.value.monday ?: thisWeek.monday)
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update {
                it.copy(timetable = it.timetable.copy(isLoading = spinner, isRefreshing = !spinner, error = null))
            }
            when (val result = loader.week(staffId, branchId, week)) {
                is AppResult.Failure -> _uiState.update {
                    it.copy(timetable = it.timetable.copy(isLoading = false, isRefreshing = false, error = result.error))
                }
                is AppResult.Success -> show(result.data, week)
            }
        }
    }

    private fun show(data: TimetableWeek, week: WeekDates) {
        val now = clock.now()
        val today = week.dayOf(now.toLocalDate())
        val days = data.days.map { it.day }
        _uiState.update { state ->
            val previous = state.timetable
            state.copy(
                timetable = previous.copy(
                    isLoading = false,
                    isRefreshing = false,
                    error = null,
                    status = data.status,
                    days = data.days,
                    today = today,
                    selectedDay = previous.selectedDay.takeIf { it in days } ?: today?.takeIf { it in days } ?: days.firstOrNull() ?: 1,
                    markers = data.days.firstOrNull { it.day == today }?.let { DayPlanner.markers(it.rows, now.toLocalTime()) }.orEmpty(),
                    openLesson = null,
                ),
            )
        }
    }
}

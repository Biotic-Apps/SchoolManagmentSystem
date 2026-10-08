package com.schoolapp.feature.timetable

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Read-only timetable; the shown week depends on the active role (see [TimetableMode]). */
@HiltViewModel
class TimetableViewModel @Inject internal constructor(
    private val authRepository: AuthRepository,
    private val loader: TimetableLoader,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TimetableUiState())
    val uiState: StateFlow<TimetableUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var branchId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            branchId = session.activeBranchId
            when (modeFor(session)) {
                TimetableMode.MY_WEEK -> {
                    val teacherView = TeacherView.WEEK.takeIf { session.activeRole == RoleKey.TEACHER }
                    _uiState.update { it.copy(mode = TimetableMode.MY_WEEK, teacherView = teacherView) }
                    loadOwnWeek()
                }
                TimetableMode.CHILD -> authRepository.session.filterNotNull()
                    .map { it.activeChild }
                    .distinctUntilChanged()
                    .collectLatest { child ->
                        val label = child?.let { listOfNotNull(it.fullName, it.className, it.sectionName).joinToString(" · ") }
                        _uiState.update { it.copy(mode = TimetableMode.CHILD, subtitle = label, isLoading = true, error = null) }
                        loadChild(child?.id)
                    }
                TimetableMode.SECTION -> {
                    _uiState.update { it.copy(mode = TimetableMode.SECTION) }
                    loadSections()
                }
            }
        }
    }

    fun onDaySelected(day: Int) = _uiState.update { it.copy(selectedDay = day) }

    fun onLessonSelected(row: ScheduleRow?) = _uiState.update { it.copy(openLesson = row?.takeIf { r -> r.isLesson }) }

    /** Teachers only: switch between the own week and the sections they teach. */
    fun onTeacherViewSelected(view: TeacherView) {
        val state = _uiState.value
        if (state.teacherView == null || state.teacherView == view) return
        _uiState.update { it.copy(teacherView = view, days = emptyList(), sectionState = null, draftNote = false, error = null) }
        when (view) {
            TeacherView.WEEK -> launchLoad { loadOwnWeek() }
            TeacherView.SECTIONS -> {
                val selected = state.selectedSectionId
                if (state.sections.isNotEmpty() && selected != null) onSectionSelected(selected) else launchLoad { loadSections() }
            }
        }
    }

    fun onSectionSelected(sectionId: String) {
        _uiState.update { it.copy(selectedSectionId = sectionId) }
        launchLoad { loadSection(sectionId) }
    }

    fun retry() = launchLoad { reload() }

    /** Pull-to-refresh: the current week stays visible while it reloads. */
    fun refresh() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            reload()
        }
    }

    private suspend fun reload() {
        val state = _uiState.value
        when {
            state.showsSections -> state.selectedSectionId?.let { loadSection(it) } ?: loadSections()
            state.mode == TimetableMode.CHILD -> loadChild(authRepository.session.first()?.activeChild?.id)
            else -> loadOwnWeek()
        }
    }

    private suspend fun loadOwnWeek() = show(loader.ownWeek(branchId, week()))

    private suspend fun loadChild(childId: String?) {
        if (childId == null) {
            show(AppResult.Success(TimetableWeek(TimetableStatus.NOT_PUBLISHED)))
            return
        }
        show(loader.childWeek(childId, week()))
    }

    private suspend fun loadSections() {
        when (val result = loader.sections()) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            is AppResult.Success -> {
                val options = result.data.sortedWith(compareBy({ it.className }, { it.name })).map {
                    SwitcherOption(it.id, listOfNotNull(it.className, it.name).joinToString(" · "))
                }
                val first = options.firstOrNull()?.id
                _uiState.update { it.copy(sections = options, selectedSectionId = first) }
                if (first == null) show(AppResult.Success(TimetableWeek(TimetableStatus.NO_SECTIONS))) else loadSection(first)
            }
        }
    }

    private suspend fun loadSection(sectionId: String) {
        val editor = _uiState.value.mode == TimetableMode.SECTION
        show(loader.section(sectionId, branchId, editor, week()))
    }

    private fun show(result: AppResult<TimetableWeek>) {
        val now = clock.now()
        val week = WeekDates.forToday(now.toLocalDate())
        val today = week.dayOf(now.toLocalDate())
        when (result) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            is AppResult.Success -> {
                val data = result.data
                val days = data.days.map { it.day }
                _uiState.update { state ->
                    val keep = state.selectedDay.takeIf { state.isRefreshing && it in days }
                    state.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = null,
                        status = data.status,
                        days = data.days,
                        today = today,
                        selectedDay = keep ?: today?.takeIf { it in days } ?: days.firstOrNull() ?: 1,
                        markers = data.days.firstOrNull { it.day == today }?.let { DayPlanner.markers(it.rows, now.toLocalTime()) }.orEmpty(),
                        sectionState = data.sectionState,
                        sectionVersion = data.sectionVersion,
                        draftNote = data.draftNote,
                        openLesson = null,
                    )
                }
            }
        }
    }

    private fun week(): WeekDates = WeekDates.forToday(clock.now().toLocalDate())

    private fun launchLoad(block: suspend () -> Unit) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            block()
        }
    }

    private fun modeFor(session: SessionContext): TimetableMode = when (session.activeRole) {
        RoleKey.TEACHER, RoleKey.HELPER -> TimetableMode.MY_WEEK
        RoleKey.PARENT -> TimetableMode.CHILD
        else -> TimetableMode.SECTION
    }
}

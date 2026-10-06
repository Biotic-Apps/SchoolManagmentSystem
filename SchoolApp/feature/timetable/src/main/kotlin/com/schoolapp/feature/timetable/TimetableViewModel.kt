package com.schoolapp.feature.timetable

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.timetable.TimetableRepository
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
class TimetableViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: TimetableRepository,
    private val scopedSections: ScopedSections,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TimetableUiState())
    val uiState: StateFlow<TimetableUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            when (modeFor(session)) {
                TimetableMode.MY_WEEK -> loadWeek(TimetableMode.MY_WEEK, studentId = null, subtitle = null)
                TimetableMode.CHILD -> authRepository.session.filterNotNull()
                    .map { it.activeChild }
                    .distinctUntilChanged()
                    .collectLatest { child ->
                        val label = child?.let { listOfNotNull(it.fullName, it.className, it.sectionName).joinToString(" · ") }
                        loadWeek(TimetableMode.CHILD, child?.id, label)
                    }
                TimetableMode.SECTION -> loadSections()
            }
        }
    }

    fun onDaySelected(day: Int) = _uiState.update { it.copy(selectedDay = day) }

    fun retry() {
        when (_uiState.value.mode) {
            TimetableMode.SECTION -> _uiState.value.selectedSectionId?.let(::onSectionSelected) ?: loadInBackground { loadSections() }
            else -> loadInBackground { loadWeek(_uiState.value.mode, currentChildId(), _uiState.value.subtitle) }
        }
    }

    fun onSectionSelected(sectionId: String) {
        _uiState.update { it.copy(selectedSectionId = sectionId, isLoading = true, error = null) }
        loadInBackground {
            apply(repository.sectionTimetable(sectionId).map { ScheduleBuilder.fromTimetable(it) })
        }
    }

    private suspend fun loadWeek(mode: TimetableMode, studentId: String?, subtitle: String?) {
        _uiState.update { it.copy(mode = mode, subtitle = subtitle, isLoading = true, error = null) }
        if (mode == TimetableMode.CHILD && studentId == null) {
            apply(AppResult.Success(emptyList()))
            return
        }
        val showTeacher = mode == TimetableMode.CHILD
        apply(repository.myWeek(studentId = studentId).map { ScheduleBuilder.fromSlots(it, showTeacher) })
    }

    private suspend fun loadSections() {
        _uiState.update { it.copy(mode = TimetableMode.SECTION, isLoading = true, error = null) }
        when (val result = scopedSections.load()) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            is AppResult.Success -> {
                val options = result.data.sortedWith(compareBy({ it.className }, { it.name })).map {
                    SwitcherOption(it.id, listOfNotNull(it.className, it.name).joinToString(" - "))
                }
                _uiState.update { it.copy(sections = options) }
                val first = options.firstOrNull()?.id
                if (first == null) {
                    _uiState.update { it.copy(isLoading = false) }
                } else {
                    _uiState.update { it.copy(selectedSectionId = first) }
                    apply(repository.sectionTimetable(first).map { ScheduleBuilder.fromTimetable(it) })
                }
            }
        }
    }

    private fun apply(result: AppResult<List<ScheduleRow>>) {
        val now = clock.now()
        val today = now.dayOfWeek.value
        when (result) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            is AppResult.Success -> {
                val rows = result.data
                val days = rows.map { it.day }.distinct().sorted().ifEmpty { DEFAULT_DAYS }
                val current = ScheduleBuilder.currentPeriodIndex(rows.filter { it.day == today }, now.toLocalTime())
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        rows = rows,
                        days = days,
                        today = today,
                        selectedDay = if (today in days) today else days.first(),
                        currentPeriodIndex = current,
                    )
                }
            }
        }
    }

    private suspend fun currentChildId(): String? = authRepository.session.first()?.activeChild?.id

    private fun loadInBackground(block: suspend () -> Unit) {
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

    private companion object {
        val DEFAULT_DAYS = (1..6).toList()
    }
}

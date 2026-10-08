package com.schoolapp.feature.timetable.bell

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.serverCode
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.TimetableBuilderRepository
import com.schoolapp.core.model.RoleKey
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Bell schedule editor: the default rows plus weekday variants (short Friday), breaks with labels, a Generate
 * helper, and the PERIODS_IN_USE confirm ("Remove these lessons and save" → `dropLessons: true`).
 * Editing needs `timetable.edit` while managing the branch (teachers only view).
 */
@HiltViewModel
class BellScheduleViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val schedules: BellScheduleRepository,
    private val editor: TimetableBuilderRepository,
    private val organisation: OrganisationRepository,
    private val authRepository: AuthRepository,
    private val events: AcademicsEvents,
) : ViewModel() {

    private val requestedBranch: String? = savedStateHandle["branchId"]
    private val _uiState = MutableStateFlow(BellUiState())
    val uiState: StateFlow<BellUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val branchId = requestedBranch ?: session.activeBranchId
                ?: (organisation.branches() as? AppResult.Success)?.data?.firstOrNull()?.id
            val canEdit = session.has(TIMETABLE_EDIT) && VIEW_ONLY_ROLES.none { it == session.activeRole }
            if (branchId == null) {
                _uiState.update { it.copy(isLoading = false, canEdit = false) }
                return@launch
            }
            when (val result = schedules.schedule(branchId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error, branchId = branchId) }
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isLoading = false,
                        branchId = branchId,
                        canEdit = canEdit,
                        workingDays = result.data.workingDays,
                        schedules = BellRules.fromSchedule(result.data),
                        selectedDay = 0,
                        dirty = false,
                    )
                }
            }
        }
    }

    fun selectDay(day: Int) = _uiState.update { it.copy(selectedDay = day, problems = emptyMap()) }

    /** Gives [day] its own times, starting from a copy of the default rows. */
    fun addVariant(day: Int) = _uiState.update { s ->
        if (s.schedules.any { it.day == day }) return@update s
        val base = s.schedules.firstOrNull { it.day == 0 }?.rows.orEmpty()
        s.copy(schedules = (s.schedules + DaySchedule(day, base)).sortedBy { it.day }, selectedDay = day, dirty = true, saved = false)
    }

    fun removeVariant(day: Int) = _uiState.update { s ->
        if (day == 0) return@update s
        s.copy(schedules = s.schedules.filterNot { it.day == day }, selectedDay = 0, dirty = true, saved = false)
    }

    fun setStart(index: Int, time: String) = editRow(index) { it.copy(startTime = time) }

    fun setEnd(index: Int, time: String) = editRow(index) { it.copy(endTime = time) }

    fun setBreak(index: Int, isBreak: Boolean) =
        editRow(index) { it.copy(isBreak = isBreak, label = if (isBreak) it.label.ifBlank { BellRules.DEFAULT_BREAK } else "") }

    fun setLabel(index: Int, label: String) = editRow(index) { it.copy(label = label.take(MAX_LABEL)) }

    fun addRow() = editRows { it + BellRules.nextRow(it.lastOrNull()) }

    fun removeRow(index: Int) = editRows { rows -> rows.filterIndexed { i, _ -> i != index } }

    // --- Generator -------------------------------------------------------------------------------

    fun openGenerator() = _uiState.update { it.copy(generator = GeneratorForm()) }

    fun dismissGenerator() = _uiState.update { it.copy(generator = null) }

    fun updateGenerator(change: (GeneratorForm) -> GeneratorForm) =
        _uiState.update { s -> s.copy(generator = s.generator?.let(change)?.copy(invalid = false)) }

    fun applyGenerator() {
        val form = _uiState.value.generator ?: return
        val minutes = form.periodMinutes.toIntOrNull()
        val count = form.periodsPerDay.toIntOrNull()
        val breakAfter = form.breakAfter.toIntOrNull() ?: 0
        val breakMinutes = form.breakMinutes.toIntOrNull() ?: 0
        if (minutes == null || minutes !in 5..180 || count == null || count !in 1..MAX_PERIODS || breakAfter !in 0 until count) {
            _uiState.update { it.copy(generator = form.copy(invalid = true)) }
            return
        }
        val rows = BellRules.generate(form.startTime, minutes, count, breakAfter, breakMinutes)
        _uiState.update { it.copy(generator = null) }
        editRows { rows }
    }

    // --- Save ------------------------------------------------------------------------------------

    fun save(dropLessons: Boolean = false) {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        val invalid = state.schedules.firstOrNull { it.rows.isEmpty() || BellRules.problems(it.rows).isNotEmpty() }
        if (invalid != null) {
            _uiState.update {
                it.copy(selectedDay = invalid.day, problems = BellRules.problems(invalid.rows), emptySchedule = invalid.rows.isEmpty())
            }
            return
        }
        _uiState.update { it.copy(saving = true, error = null, lessonsToDrop = null, problems = emptyMap(), emptySchedule = false) }
        viewModelScope.launch {
            when (val result = editor.saveBellSchedule(branchId, BellRules.toInput(state.schedules, dropLessons))) {
                is AppResult.Success -> {
                    _uiState.update {
                        it.copy(saving = false, dirty = false, saved = true, schedules = BellRules.fromSchedule(result.data), workingDays = result.data.workingDays)
                    }
                    events.changed()
                }
                is AppResult.Failure -> {
                    val error = result.error.toActionError()
                    _uiState.update {
                        if (result.error.serverCode == PERIODS_IN_USE) {
                            it.copy(saving = false, lessonsToDrop = error.details)
                        } else {
                            it.copy(saving = false, error = error)
                        }
                    }
                }
            }
        }
    }

    fun dismissDrop() = _uiState.update { it.copy(lessonsToDrop = null) }

    fun dismissError() = _uiState.update { it.copy(error = null) }

    private fun editRow(index: Int, change: (BellRow) -> BellRow) =
        editRows { rows -> rows.mapIndexed { i, row -> if (i == index) change(row) else row } }

    private fun editRows(change: (List<BellRow>) -> List<BellRow>) = _uiState.update { s ->
        val day = s.current?.day ?: return@update s
        s.copy(
            schedules = s.schedules.map { if (it.day == day) it.copy(rows = change(it.rows)) else it },
            dirty = true,
            saved = false,
            problems = emptyMap(),
            emptySchedule = false,
        )
    }

    internal companion object {
        const val TIMETABLE_EDIT = "timetable.edit"
        const val PERIODS_IN_USE = "PERIODS_IN_USE"
        const val MAX_LABEL = 40
        const val MAX_PERIODS = 12
        val VIEW_ONLY_ROLES = setOf(RoleKey.TEACHER, RoleKey.HELPER, RoleKey.PARENT)
    }
}

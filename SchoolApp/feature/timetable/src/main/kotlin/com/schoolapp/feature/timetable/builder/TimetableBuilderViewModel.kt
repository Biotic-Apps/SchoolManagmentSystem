package com.schoolapp.feature.timetable.builder

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.timetable.TimetableBuilderRepository
import com.schoolapp.core.model.academics.NamedRef
import com.schoolapp.core.model.timetable.DraftSlot
import com.schoolapp.core.model.timetable.LessonInput
import com.schoolapp.core.ui.SaveTracker
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

/**
 * Builder: pick a section, then each lesson is saved on its own (PUT/DELETE one slot) with the grid updated at
 * once and put back if the server refuses. Rights come from the server (`canEdit`) and `timetable.publish`.
 */
@HiltViewModel
class TimetableBuilderViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: TimetableBuilderRepository,
    private val overview: ClassesOverviewRepository,
    private val scope: TimetableBranchScope,
    private val allocation: TeacherAllocationRepository,
    private val catalogue: CatalogueRepository,
    private val authRepository: AuthRepository,
    private val events: AcademicsEvents,
) : ViewModel() {

    private val initialSection: String? = savedStateHandle["sectionId"]
    private val _uiState = MutableStateFlow(BuilderUiState(sectionId = initialSection))
    val uiState: StateFlow<BuilderUiState> = _uiState.asStateFlow()

    private val tracker = SaveTracker()
    private var branchId: String? = null
    private var loadJob: Job? = null
    internal val lessons = LessonEditorController(_uiState)

    init {
        viewModelScope.launch { tracker.status.collect { s -> _uiState.update { it.copy(saveStatus = s) } } }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(mayPublish = session.has(TIMETABLE_PUBLISH)) }
            branchId = (scope.branchId(session) as? AppResult.Success)?.data
            loadChoices()
        }
    }

    fun retry() = viewModelScope.launch { loadChoices() }

    /** Pull-to-refresh: reloads the open section (other editors' lessons, conflicts, busy teachers). */
    fun refresh() {
        val sectionId = _uiState.value.sectionId
        if (sectionId == null) {
            retry()
            return
        }
        _uiState.update { it.copy(isRefreshing = true) }
        loadBuilder(sectionId, spinner = false)
        viewModelScope.launch { loadChoices(keepSelection = true) }
    }

    fun selectSection(sectionId: String) {
        if (sectionId == _uiState.value.sectionId && _uiState.value.builder != null) return
        _uiState.update { it.copy(sectionId = sectionId, builder = null, editor = null) }
        loadBuilder(sectionId, spinner = true)
    }

    fun selectDay(day: Int) = _uiState.update { it.copy(selectedDay = day) }

    fun showLessons(show: Boolean) = _uiState.update { it.copy(showLessons = show) }

    fun dismissError() = _uiState.update { it.copy(actionError = null) }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    // --- Lessons ---------------------------------------------------------------------------------

    /** Saves the open sheet; the grid changes right away and goes back if the server refuses. */
    fun saveLesson() {
        val state = _uiState.value
        val editor = state.editor ?: return
        val builder = state.builder ?: return
        val subjectId = editor.subjectId
        val staffId = editor.staffId
        if (subjectId == null || staffId == null) {
            _uiState.update { it.copy(editor = editor.copy(showErrors = true)) }
            return
        }
        val slot = DraftSlot(
            editor.day,
            editor.periodIndex,
            builder.lessons.first { it.subject.id == subjectId }.subject,
            staffRef(staffId),
            editor.roomId?.let { id -> builder.rooms.firstOrNull { it.id == id } },
        )
        val input = LessonInput(subjectId, staffId, editor.roomId, allocate = editor.allocate && lessons.canAllocate(state))
        _uiState.update { it.copy(editor = null) }
        change(editor.day, editor.periodIndex, slot) { repository.saveLesson(builder.sectionId, editor.day, editor.periodIndex, input) }
    }

    fun removeLesson() {
        val editor = _uiState.value.editor ?: return
        val sectionId = _uiState.value.sectionId ?: return
        _uiState.update { it.copy(editor = null) }
        change(editor.day, editor.periodIndex, null) { repository.removeLesson(sectionId, editor.day, editor.periodIndex) }
    }

    /** "+ New room" from the lesson sheet; the new room is picked. */
    fun createRoom(name: String) {
        val branch = _uiState.value.builder?.branchId ?: branchId ?: return
        viewModelScope.launch {
            when (val result = tracker.track { catalogue.createRoom(branch, name) }) {
                is AppResult.Failure -> _uiState.update { it.copy(actionError = result.error.toActionError()) }
                is AppResult.Success -> _uiState.update { s ->
                    val room = NamedRef(result.data.id, result.data.name)
                    s.copy(
                        builder = s.builder?.let { it.copy(rooms = it.rooms + room) },
                        editor = s.editor?.copy(roomId = room.id),
                    )
                }
            }
        }
    }

    private fun change(day: Int, periodIndex: Int, slot: DraftSlot?, call: suspend () -> AppResult<com.schoolapp.core.model.timetable.LessonSaveResult>) {
        val before = _uiState.value.builder ?: return
        _uiState.update { it.copy(builder = BuilderEdits.withSlot(before, day, periodIndex, slot), actionError = null) }
        viewModelScope.launch {
            when (val result = tracker.track(call)) {
                is AppResult.Success -> {
                    _uiState.update { s -> s.copy(builder = s.builder?.let { BuilderEdits.withResult(it, day, periodIndex, result.data) }) }
                    events.changed()
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(builder = BuilderEdits.withSlot(it.builder ?: before, day, periodIndex, before.draft.slotAt(day, periodIndex)), actionError = result.error.toActionError())
                }
            }
        }
    }

    // --- Publish / discard -----------------------------------------------------------------------

    fun publish() {
        val sectionId = _uiState.value.sectionId ?: return
        _uiState.update { it.copy(publishing = true, actionError = null) }
        viewModelScope.launch {
            val result = repository.publish(sectionId)
            _uiState.update {
                it.copy(
                    publishing = false,
                    actionError = (result as? AppResult.Failure)?.error?.toActionError(),
                    notice = BuilderNotice.PUBLISHED.takeIf { result is AppResult.Success },
                )
            }
            afterLifecycleChange(sectionId)
        }
    }

    fun askDiscard(show: Boolean) = _uiState.update { it.copy(confirmDiscard = show) }

    fun discard() {
        val sectionId = _uiState.value.sectionId ?: return
        _uiState.update { it.copy(confirmDiscard = false, discarding = true, actionError = null) }
        viewModelScope.launch {
            val result = repository.discard(sectionId)
            _uiState.update {
                it.copy(
                    discarding = false,
                    actionError = (result as? AppResult.Failure)?.error?.toActionError(),
                    notice = BuilderNotice.DISCARDED.takeIf { result is AppResult.Success },
                )
            }
            afterLifecycleChange(sectionId)
        }
    }

    private fun afterLifecycleChange(sectionId: String) {
        events.changed()
        loadBuilder(sectionId, spinner = false)
        viewModelScope.launch { loadChoices(keepSelection = true) }
    }

    // --- Loading ---------------------------------------------------------------------------------

    private suspend fun loadChoices(keepSelection: Boolean = false) {
        val branch = branchId
        val choices = branch?.let { overview.overview(it, null, null) }
        val list = (choices as? AppResult.Success)?.data.orEmpty().flatMap { item ->
            item.sections.map { s ->
                SectionChoice(s.id, listOfNotNull(item.name, s.name).joinToString(" · ") + (s.group?.let { " ($it)" } ?: ""), s.timetable)
            }
        }
        _uiState.update { it.copy(choices = list) }
        if (keepSelection) return
        val selected = _uiState.value.sectionId ?: list.firstOrNull()?.id
        if (selected == null) {
            _uiState.update { it.copy(isLoading = false, error = (choices as? AppResult.Failure)?.error) }
        } else {
            _uiState.update { it.copy(sectionId = selected) }
            loadBuilder(selected, spinner = true)
        }
    }

    private fun loadBuilder(sectionId: String, spinner: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            if (spinner) _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.builder(sectionId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                is AppResult.Success -> {
                    val days = result.data.draft.workingDays
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isRefreshing = false,
                            error = null,
                            builder = result.data,
                            selectedDay = it.selectedDay.takeIf { d -> days.isEmpty() || d in days } ?: days.first(),
                        )
                    }
                    loadStaff(result.data.branchId, result.data.draft.sessionId)
                }
            }
        }
    }

    /** Teachers building their own section may not see the branch list: the allocated teachers are used then. */
    private suspend fun loadStaff(branch: String, sessionId: String?) {
        if (_uiState.value.staff.isNotEmpty()) return
        (allocation.teachingStaff(branch, sessionId) as? AppResult.Success)?.let { r -> _uiState.update { it.copy(staff = r.data) } }
    }

    private fun staffRef(staffId: String): NamedRef {
        val state = _uiState.value
        val name = state.staff.firstOrNull { it.id == staffId }?.name
            ?: state.builder?.lessons?.firstNotNullOfOrNull { it.teacher?.takeIf { t -> t.id == staffId }?.name }
        return NamedRef(staffId, name.orEmpty())
    }

    private companion object {
        const val TIMETABLE_PUBLISH = "timetable.publish"
    }
}

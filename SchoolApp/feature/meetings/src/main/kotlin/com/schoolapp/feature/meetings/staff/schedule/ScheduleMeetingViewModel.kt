package com.schoolapp.feature.meetings.staff.schedule

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.meeting.StaffMeetingInput
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.meetings.domain.MeetingTimeDraft
import com.schoolapp.feature.meetings.staff.schedule.components.MIN_QUERY
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Staff schedule a meeting with a verified guardian of a student in their scope (`POST /meetings`, no slot). */
@OptIn(FlowPreview::class)
@HiltViewModel
class ScheduleMeetingViewModel @Inject constructor(
    private val meetingsRepository: MeetingsRepository,
    private val studentsRepository: StudentsRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate()
    private val _uiState = MutableStateFlow(
        ScheduleMeetingUiState(today = today.toString(), time = MeetingTimeDraft(date = today.plusDays(1).toString())),
    )
    val uiState: StateFlow<ScheduleMeetingUiState> = _uiState.asStateFlow()

    private val query = MutableStateFlow("")
    private var guardiansJob: Job? = null

    init {
        viewModelScope.launch { query.debounce(SEARCH_DEBOUNCE_MS).distinctUntilChanged().collectLatest(::search) }
    }

    fun onQueryChange(text: String) {
        _uiState.update { it.copy(query = text) }
        query.value = text.trim()
    }

    fun onStudentSelected(student: StudentSummary) {
        _uiState.update { it.copy(student = student, studentMissing = false, results = emptyList(), guardianId = null) }
        loadGuardians()
    }

    fun onClearStudent() {
        guardiansJob?.cancel()
        query.value = ""
        _uiState.update {
            it.copy(student = null, query = "", guardians = emptyList(), guardianId = null, isLoadingGuardians = false, guardiansError = null)
        }
    }

    fun retryGuardians() = loadGuardians()

    fun onGuardianSelected(id: String) = _uiState.update { it.copy(guardianId = id, guardianMissing = false) }

    fun onTimeChange(draft: MeetingTimeDraft) = _uiState.update {
        it.copy(time = draft, timeProblems = if (it.timeProblems.isEmpty()) emptySet() else draft.problems(it.today))
    }

    fun onAgendaChange(text: String) = _uiState.update { it.copy(agenda = text, agendaError = null) }

    fun submit() {
        val state = _uiState.value
        if (state.isSubmitting) return
        val agenda = state.agenda.trim()
        val agendaError = when {
            agenda.isEmpty() -> AgendaError.MISSING
            agenda.length > MAX_AGENDA -> AgendaError.TOO_LONG
            else -> null
        }
        val checked = state.copy(
            studentMissing = state.student == null,
            guardianMissing = state.student != null && state.guardianId == null,
            timeProblems = state.time.problems(state.today),
            agendaError = agendaError,
        )
        val student = state.student
        val guardianId = state.guardianId
        if (student == null || guardianId == null || checked.timeProblems.isNotEmpty() || agendaError != null) {
            _uiState.value = checked
            return
        }
        _uiState.value = checked.copy(isSubmitting = true, error = null)
        val time = state.time
        val input = StaffMeetingInput(student.id, guardianId, time.date, time.startTime, time.endTime, time.mode, agenda, time.location)
        viewModelScope.launch {
            when (val result = meetingsRepository.schedule(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, createdId = result.data.id) }
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, error = result.error) }
            }
        }
    }

    fun onNavigated() = _uiState.update { it.copy(createdId = null) }

    private fun loadGuardians() {
        val student = _uiState.value.student ?: return
        guardiansJob?.cancel()
        _uiState.update { it.copy(guardians = emptyList(), isLoadingGuardians = true, guardiansError = null) }
        guardiansJob = viewModelScope.launch {
            when (val result = studentsRepository.student(student.id)) {
                is AppResult.Success -> {
                    val links = result.data.guardians.filter { it.status.equals(VERIFIED, ignoreCase = true) }
                    val primary = (links.firstOrNull { it.isPrimary } ?: links.firstOrNull())?.guardian?.id
                    _uiState.update { it.copy(guardians = links, guardianId = primary, isLoadingGuardians = false) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoadingGuardians = false, guardiansError = result.error) }
            }
        }
    }

    private suspend fun search(text: String) {
        if (text.length < MIN_QUERY) {
            _uiState.update { it.copy(results = emptyList(), isSearching = false, searchError = null) }
            return
        }
        _uiState.update { it.copy(isSearching = true, searchError = null) }
        when (val result = studentsRepository.students(search = text)) {
            is AppResult.Success -> _uiState.update { it.copy(isSearching = false, results = result.data) }
            is AppResult.Failure -> _uiState.update { it.copy(isSearching = false, results = emptyList(), searchError = result.error) }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
        const val MAX_AGENDA = 1000
        const val VERIFIED = "VERIFIED"
    }
}

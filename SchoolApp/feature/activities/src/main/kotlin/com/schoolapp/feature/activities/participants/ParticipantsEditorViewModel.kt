package com.schoolapp.feature.activities.participants

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.activity.ConsentStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Roster editor: add (granted consents, or student search), set role / result / position / remarks, save in one PUT. */
@HiltViewModel
class ParticipantsEditorViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ActivitiesRepository,
    private val studentsRepository: StudentsRepository,
) : ViewModel() {

    private val activityId: String = checkNotNull(savedStateHandle["activityId"]) { "Activity id missing" }
    private val _uiState = MutableStateFlow(ParticipantsEditorUiState())
    val uiState: StateFlow<ParticipantsEditorUiState> = _uiState.asStateFlow()

    private var grantedAll: List<Candidate> = emptyList()
    private var searchJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val activity = when (val result = repository.activity(activityId)) {
                is AppResult.Success -> result.data
                is AppResult.Failure -> return@launch _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
            val participants = when (val result = repository.participants(activityId)) {
                is AppResult.Success -> result.data
                is AppResult.Failure -> return@launch _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
            if (activity.consentRequired) {
                val consents = (repository.consents(activityId) as? AppResult.Success)?.data.orEmpty()
                grantedAll = consents.filter { it.status == ConsentStatus.GRANTED }.map { Candidate(it.studentId, it.studentName, it.guardianName) }
            }
            _uiState.update {
                it.copy(
                    isLoading = false,
                    title = activity.title,
                    consentRequired = activity.consentRequired,
                    maxParticipants = activity.maxParticipants,
                    rows = participants.map { p -> p.toRow() },
                ).withCandidates()
            }
        }
    }

    fun onSearch(text: String) {
        _uiState.update { it.copy(search = text, searchError = null) }
        searchJob?.cancel()
        if (text.trim().length < MIN_SEARCH) return _uiState.update { it.copy(results = emptyList(), isSearching = false) }
        searchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            _uiState.update { it.copy(isSearching = true) }
            when (val result = studentsRepository.students(search = text.trim())) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isSearching = false, results = result.data.map { s -> s.toCandidate() }).withCandidates()
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSearching = false, searchError = result.error) }
            }
        }
    }

    fun add(candidate: Candidate) {
        if (_uiState.value.rows.any { it.studentId == candidate.studentId }) return
        _uiState.update {
            it.copy(rows = it.rows + ParticipantRow(candidate.studentId, candidate.name), dirty = true, search = "", results = emptyList(), saveError = null)
                .withCandidates()
        }
    }

    fun askRemove(row: ParticipantRow) = _uiState.update { it.copy(confirmRemove = row) }

    fun dismissRemove() = _uiState.update { it.copy(confirmRemove = null) }

    fun confirmRemove() {
        val row = _uiState.value.confirmRemove ?: return
        _uiState.update { state ->
            state.copy(rows = state.rows.filterNot { it.studentId == row.studentId }, confirmRemove = null, dirty = true).withCandidates()
        }
    }

    fun onRowChange(row: ParticipantRow) = _uiState.update { state ->
        state.copy(rows = state.rows.map { if (it.studentId == row.studentId) row.copy(position = row.position.filter(Char::isDigit)) else it }, dirty = true)
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving || state.overLimit) return
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.saveParticipants(activityId, state.rows.map { it.toParticipant() })) {
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(isSaving = false, dirty = false, saved = true, rows = result.data.map { p -> p.toRow() }).withCandidates()
                }
            }
        }
    }

    fun onSavedShown() = _uiState.update { it.copy(saved = false) }

    private fun ParticipantsEditorUiState.withCandidates(): ParticipantsEditorUiState {
        val taken = rows.map { it.studentId }.toSet()
        return copy(granted = grantedAll.filterNot { it.studentId in taken }, results = results.filterNot { it.studentId in taken })
    }

    private companion object {
        const val MIN_SEARCH = 2
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}

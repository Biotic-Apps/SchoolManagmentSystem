package com.schoolapp.feature.diary.supervisor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.diary.MissingDiary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/** Principal / coordinator view: sections missing a diary for the date, plus read-only browsing of any section's entries. */
@HiltViewModel
class SupervisorDiaryViewModel @Inject constructor(
    private val diaryRepository: DiaryRepository,
    private val scopedSections: ScopedSections,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate().toString()
    private var missingJob: Job? = null
    private var entriesJob: Job? = null

    private val _uiState = MutableStateFlow(SupervisorDiaryUiState(date = today, today = today))
    val uiState: StateFlow<SupervisorDiaryUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { it.activeRole to it.activeBranchId }.distinctUntilChanged().collect {
                reloadAll()
            }
        }
    }

    fun reloadAll() {
        loadMissing()
        viewModelScope.launch { loadSections() }
    }

    fun onPreviousDay() = onDateSelected(LocalDate.parse(_uiState.value.date).minusDays(1).toString())

    fun onNextDay() {
        val next = LocalDate.parse(_uiState.value.date).plusDays(1).toString()
        if (next <= today) onDateSelected(next)
    }

    fun onDateSelected(date: String) {
        if (date == _uiState.value.date) return
        _uiState.update { it.copy(date = date, returnedMessage = false) }
        loadMissing()
        loadEntries()
    }

    fun onSectionSelected(sectionId: String) {
        _uiState.update { it.copy(selectedSectionId = sectionId, returnedMessage = false) }
        loadEntries()
    }

    fun loadMissing() {
        val date = _uiState.value.date
        missingJob?.cancel()
        _uiState.update { it.copy(missingLoading = true, missingError = null) }
        missingJob = viewModelScope.launch {
            val branchId = authRepository.session.filterNotNull().first().activeBranchId
            when (val result = diaryRepository.missing(branchId, date)) {
                is AppResult.Failure -> _uiState.update { it.copy(missingLoading = false, missingError = result.error) }
                is AppResult.Success -> _uiState.update { it.copy(missingLoading = false, missing = group(result.data)) }
            }
        }
    }

    fun loadEntries() {
        val state = _uiState.value
        val sectionId = state.selectedSectionId ?: return
        entriesJob?.cancel()
        _uiState.update { it.copy(entriesLoading = true, entriesError = null) }
        entriesJob = viewModelScope.launch {
            when (val result = diaryRepository.entries(sectionId, date = state.date)) {
                is AppResult.Failure -> _uiState.update { it.copy(entriesLoading = false, entriesError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(entriesLoading = false, entries = result.data.sortedBy { e -> e.subjectName.orEmpty().lowercase() })
                }
            }
        }
    }

    fun onReturnClick(entryId: String) {
        val entry = _uiState.value.entries.firstOrNull { it.id == entryId } ?: return
        if (!_uiState.value.canReturn) return
        _uiState.update { it.copy(returnEditor = ReturnEditor(entry.id, entry.subjectName), returnedMessage = false) }
    }

    fun onReturnCommentChange(value: String) = editReturn { it.copy(comment = value, commentMissing = false) }

    fun onDismissReturn() {
        if (_uiState.value.returnEditor?.isSaving == true) return
        _uiState.update { it.copy(returnEditor = null) }
    }

    fun submitReturn() {
        val editor = _uiState.value.returnEditor ?: return
        if (editor.isSaving) return
        if (editor.comment.isBlank()) return editReturn { it.copy(commentMissing = true) }
        editReturn { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = diaryRepository.returnEntry(editor.entryId, editor.comment.trim())) {
                is AppResult.Failure -> editReturn { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(
                        returnEditor = null,
                        returnedMessage = true,
                        entries = state.entries.map { if (it.id == result.data.id) result.data else it },
                    )
                }
            }
        }
    }

    private suspend fun loadSections() {
        val session = authRepository.session.filterNotNull().first()
        _uiState.update { it.copy(canReturn = session.has(APPROVE_PERMISSION), sectionsError = null) }
        when (val result = scopedSections.load()) {
            is AppResult.Failure -> _uiState.update { it.copy(sectionsError = result.error) }
            is AppResult.Success -> {
                val options = result.data.sortedWith(compareBy({ it.className }, { it.name }))
                    .map { SwitcherOption(it.id, listOfNotNull(it.className, it.name).joinToString(" - ")) }
                val selected = _uiState.value.selectedSectionId?.takeIf { id -> options.any { it.id == id } } ?: options.firstOrNull()?.id
                _uiState.update { it.copy(sections = options, selectedSectionId = selected, entries = if (selected == null) emptyList() else it.entries) }
                loadEntries()
            }
        }
    }

    private fun group(missing: List<MissingDiary>): List<MissingGroup> = missing
        .groupBy { it.sectionId }
        .map { (sectionId, rows) ->
            val first = rows.first()
            MissingGroup(
                sectionId = sectionId,
                title = listOfNotNull(first.className, first.sectionName).joinToString(" - ").ifBlank { sectionId },
                subjects = rows.mapNotNull { it.subjectName }.distinct(),
            )
        }
        .sortedBy { it.title }

    private fun editReturn(transform: (ReturnEditor) -> ReturnEditor) =
        _uiState.update { state -> state.copy(returnEditor = state.returnEditor?.let(transform)) }

    private companion object {
        const val APPROVE_PERMISSION = "diary.approve"
    }
}

package com.schoolapp.feature.progress.notes

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNoteInput
import com.schoolapp.core.model.progress.ProgressNoteOutcome
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One student's progress notes; staff with `progress.edit` can add (probation teachers' notes go for review). */
@HiltViewModel
class StudentNotesViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ProgressRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val studentId: String = checkNotNull(savedStateHandle["studentId"])

    private val _uiState = MutableStateFlow(
        StudentNotesUiState(studentName = savedStateHandle["studentName"] ?: "", rollNo = savedStateHandle.get<Any?>("rollNo") as? Int),
    )
    val uiState: StateFlow<StudentNotesUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canAdd = session.has(EDIT_PERMISSION)) }
        }
        load()
    }

    fun retry() = load()

    fun openForm() {
        if (_uiState.value.canAdd) _uiState.update { it.copy(form = NoteForm(), message = null) }
    }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun onCategoryChange(category: ProgressCategory) = updateForm { it.copy(category = category, categoryMissing = false) }

    fun onNoteChange(note: String) = updateForm { it.copy(note = note, noteError = null) }

    fun onVisibleChange(visible: Boolean) = updateForm { it.copy(visibleToParent = visible) }

    fun dismissMessage() = _uiState.update { it.copy(message = null) }

    fun submit() {
        val form = _uiState.value.form ?: return
        if (form.isSaving) return
        val note = form.note.trim()
        val noteError = when {
            note.isEmpty() -> NoteError.REQUIRED
            note.length > NOTE_MAX_LENGTH -> NoteError.TOO_LONG
            else -> null
        }
        val category = form.category
        if (category == null || noteError != null) {
            updateForm { it.copy(categoryMissing = category == null, noteError = noteError) }
            return
        }
        updateForm { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.addNote(studentId, ProgressNoteInput(category, note, form.visibleToParent))) {
                is AppResult.Failure -> updateForm { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> when (val outcome = result.data) {
                    is ProgressNoteOutcome.Saved -> _uiState.update {
                        it.copy(form = null, message = NoteMessage.SAVED, notes = listOf(outcome.note) + it.notes.filterNot { n -> n.id == outcome.note.id })
                    }
                    is ProgressNoteOutcome.PendingReview -> _uiState.update { it.copy(form = null, message = NoteMessage.PENDING_REVIEW) }
                }
            }
        }
    }

    private fun load() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = repository.notes(studentId)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isLoading = false, notes = result.data)
                    is AppResult.Failure -> it.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    private fun updateForm(transform: (NoteForm) -> NoteForm) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it)) } ?: state }

    private companion object {
        const val EDIT_PERMISSION = "progress.edit"
    }
}

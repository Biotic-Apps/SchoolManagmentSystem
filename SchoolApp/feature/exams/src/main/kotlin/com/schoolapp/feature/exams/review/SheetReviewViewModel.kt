package com.schoolapp.feature.exams.review

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.feature.exams.ExamPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Reviewer view of one mark sheet: read-only marks with Accept / Return (`exams.approve`). */
@HiltViewModel
class SheetReviewViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val sheetId: String = checkNotNull(savedStateHandle["sheetId"]) { "Sheet id missing" }

    private val _uiState = MutableStateFlow(SheetReviewUiState(title = savedStateHandle["title"] ?: ""))
    val uiState: StateFlow<SheetReviewUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.sheet == null, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canApprove = ExamPermissions.canApprove(session)) }
            when (val result = repository.markSheet(sheetId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, sheet = result.data.sheet) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun openDecision(kind: ReviewKind) {
        if (!_uiState.value.canDecide) return
        _uiState.update { it.copy(decision = ReviewDecision(kind)) }
    }

    fun onCommentChange(comment: String) = editDecision { it.copy(comment = comment, commentMissing = false) }

    fun onDismissDecision() {
        if (_uiState.value.decision?.isSaving == true) return
        _uiState.update { it.copy(decision = null) }
    }

    fun confirmDecision() {
        val decision = _uiState.value.decision ?: return
        if (decision.isSaving) return
        val comment = decision.comment.trim()
        if (decision.kind == ReviewKind.RETURN && comment.isEmpty()) {
            editDecision { it.copy(commentMissing = true) }
            return
        }
        editDecision { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = when (decision.kind) {
                ReviewKind.ACCEPT -> repository.accept(sheetId, comment.ifEmpty { null })
                ReviewKind.RETURN -> repository.returnSheet(sheetId, comment)
            }
            when (result) {
                is AppResult.Failure -> editDecision { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> _uiState.update { state ->
                    // A decision response may omit the rows; keep the ones on screen.
                    val updated = result.data.takeIf { it.rows.isNotEmpty() }
                        ?: result.data.copy(rows = state.sheet?.rows.orEmpty(), entered = state.sheet?.entered ?: 0, total = state.sheet?.total ?: 0)
                    state.copy(sheet = updated, decision = null, decided = decision.kind)
                }
            }
        }
    }

    private fun editDecision(transform: (ReviewDecision) -> ReviewDecision) =
        _uiState.update { state -> state.copy(decision = state.decision?.let(transform)) }
}

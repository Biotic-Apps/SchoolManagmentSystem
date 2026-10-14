package com.schoolapp.feature.homework.submissions

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.homework.HomeworkRepository
import com.schoolapp.core.model.homework.HomeworkChange
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.core.model.homework.SubmissionGrade
import com.schoolapp.feature.homework.HomeworkSubmissionsDestination
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One homework's submissions; grading and returning need `homework.edit` (web SubmissionsPanel). */
@HiltViewModel
class SubmissionsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val authRepository: AuthRepository,
    private val repository: HomeworkRepository,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<HomeworkSubmissionsDestination>()
    private val homeworkId: String = route.homeworkId

    private val _uiState = MutableStateFlow(
        SubmissionsUiState(title = route.title, subjectName = route.subjectName, dueDate = route.dueDate, maxMarks = route.maxMarks),
    )
    val uiState: StateFlow<SubmissionsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canReview = session.has(EDIT_PERMISSION)) }
        }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.submissions.isEmpty() && !it.isRefreshing, error = null) }
        viewModelScope.launch {
            val result = repository.submissions(homeworkId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, submissions = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun onChangeShown() = _uiState.update { it.copy(change = null) }

    // ─── Grade ────────────────────────────────────────────────

    fun openGrade(submission: HomeworkSubmission) = _uiState.update { it.copy(grading = GradeDraft(submission)) }

    fun closeGrade() = _uiState.update { if (it.grading?.isSaving == true) it else it.copy(grading = null) }

    fun onMarks(value: String) = updateGrade { it.copy(marks = value.filter(Char::isDigit).take(MARKS_DIGITS), marksInvalid = false) }

    fun onGrade(value: String) = updateGrade { it.copy(grade = value, gradeTooLong = false) }

    fun onFeedback(value: String) = updateGrade { it.copy(feedback = value, feedbackTooLong = false) }

    fun saveGrade() {
        val draft = _uiState.value.grading ?: return
        if (draft.isSaving) return
        val limit = _uiState.value.maxMarks ?: MARKS_MAX
        val marks = draft.marks.takeIf { it.isNotBlank() }?.toIntOrNull()
        val marksInvalid = draft.marks.isNotBlank() && (marks == null || marks > limit)
        val gradeTooLong = draft.grade.trim().length > GRADE_MAX
        val feedbackTooLong = draft.feedback.trim().length > FEEDBACK_MAX
        if (marksInvalid || gradeTooLong || feedbackTooLong) {
            return updateGrade { it.copy(marksInvalid = marksInvalid, gradeTooLong = gradeTooLong, feedbackTooLong = feedbackTooLong) }
        }
        updateGrade { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = repository.grade(draft.submission.id, SubmissionGrade(marks, draft.grade, draft.feedback))
            when (result) {
                is AppResult.Success -> applySaved(result.data, HomeworkChange.GRADED)
                is AppResult.Failure -> updateGrade { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    // ─── Return ───────────────────────────────────────────────

    fun openReturn(submission: HomeworkSubmission, defaultNote: String) =
        _uiState.update { it.copy(returning = ReturnDraft(submission, defaultNote)) }

    fun closeReturn() = _uiState.update { if (it.returning?.isSaving == true) it else it.copy(returning = null) }

    fun onReturnNote(value: String) = updateReturn { it.copy(note = value, noteMissing = false) }

    fun confirmReturn() {
        val draft = _uiState.value.returning ?: return
        if (draft.isSaving) return
        if (draft.note.isBlank()) return updateReturn { it.copy(noteMissing = true) }
        updateReturn { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.returnSubmission(draft.submission.id, draft.note.take(FEEDBACK_MAX))) {
                is AppResult.Success -> applySaved(result.data, HomeworkChange.RETURNED)
                is AppResult.Failure -> updateReturn { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun applySaved(saved: HomeworkSubmission, change: HomeworkChange) = _uiState.update { state ->
        state.copy(
            submissions = state.submissions.map { if (it.id == saved.id) saved.withStudentFrom(it) else it },
            grading = null,
            returning = null,
            change = change,
        )
    }

    private fun HomeworkSubmission.withStudentFrom(old: HomeworkSubmission) =
        if (student == null) copy(student = old.student) else this

    private fun updateGrade(block: (GradeDraft) -> GradeDraft) =
        _uiState.update { state -> state.grading?.let { state.copy(grading = block(it)) } ?: state }

    private fun updateReturn(block: (ReturnDraft) -> ReturnDraft) =
        _uiState.update { state -> state.returning?.let { state.copy(returning = block(it)) } ?: state }

    internal companion object {
        const val EDIT_PERMISSION = "homework.edit"
        const val MARKS_MAX = 1000
        const val MARKS_DIGITS = 4
        const val GRADE_MAX = 20
        const val FEEDBACK_MAX = 2000
    }
}

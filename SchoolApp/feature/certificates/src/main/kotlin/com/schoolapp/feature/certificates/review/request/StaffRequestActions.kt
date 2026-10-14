package com.schoolapp.feature.certificates.review.request

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.certificates.review.CertificateReviewUiState
import com.schoolapp.feature.certificates.review.ReviewFilter
import com.schoolapp.feature.certificates.review.ReviewMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Staff "New request" sheet (`certificates.add`): debounced student search, type, purpose, achievement. */
internal class StaffRequestActions(
    private val scope: CoroutineScope,
    private val state: MutableStateFlow<CertificateReviewUiState>,
    private val repository: CertificatesRepository,
    private val students: StudentsRepository,
) {
    private var searchJob: Job? = null

    fun open() {
        if (state.value.canIssue) state.update { it.copy(requestForm = StaffRequestForm(), message = null) }
    }

    fun dismiss() = state.update { if (it.requestForm?.isSaving == true) it else it.copy(requestForm = null) }

    fun onQueryChange(query: String) {
        updateSearch { it.copy(query = query) }
        searchJob?.cancel()
        val term = query.trim()
        if (term.length < MIN_LENGTH) {
            updateSearch { it.copy(searching = false, searched = false, results = emptyList(), error = null) }
            return
        }
        searchJob = scope.launch {
            delay(DEBOUNCE_MS)
            updateSearch { it.copy(searching = true, error = null) }
            val result = students.students(search = term)
            updateSearch { search ->
                when (result) {
                    is AppResult.Success -> search.copy(searching = false, searched = true, results = result.data)
                    is AppResult.Failure -> search.copy(searching = false, searched = true, results = emptyList(), error = result.error)
                }
            }
        }
    }

    fun onPick(student: StudentSummary) = update { it.copy(student = student, studentMissing = false, search = StudentSearchState()) }

    fun clearStudent() = update { it.copy(student = null) }

    fun onTypeChange(type: CertificateType) = update { it.copy(type = type, typeMissing = false) }

    fun onPurposeChange(purpose: String) = update { it.copy(purpose = purpose) }

    fun onAchievementChange(text: String) = update { it.copy(achievement = text, achievementMissing = false) }

    fun submit() {
        val form = state.value.requestForm ?: return
        if (form.isSaving) return
        val student = form.student
        val type = form.type
        val achievementMissing = type == CertificateType.ACHIEVEMENT && form.achievement.isBlank()
        if (student == null || type == null || achievementMissing) {
            update { it.copy(studentMissing = student == null, typeMissing = type == null, achievementMissing = achievementMissing) }
            return
        }
        update { it.copy(isSaving = true, error = null) }
        scope.launch {
            val achievement = form.achievement.trim().takeIf { type == CertificateType.ACHIEVEMENT }
            val input = CertificateInput(student.id, type, form.purpose.trim().ifEmpty { null }, achievement)
            when (val result = repository.request(input)) {
                is AppResult.Failure -> update { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> state.update { current ->
                    val shown = current.filter == ReviewFilter.ALL || current.filter.status == CertificateStatus.REQUESTED
                    val list = if (shown) listOf(result.data) + current.certificates else current.certificates
                    current.copy(requestForm = null, certificates = list, message = ReviewMessage.REQUESTED)
                }
            }
        }
    }

    private fun updateSearch(transform: (StudentSearchState) -> StudentSearchState) = update { it.copy(search = transform(it.search)) }

    private fun update(transform: (StaffRequestForm) -> StaffRequestForm) =
        state.update { current -> current.requestForm?.let { current.copy(requestForm = transform(it)) } ?: current }

    private companion object {
        const val MIN_LENGTH = 2
        const val DEBOUNCE_MS = 300L
    }
}

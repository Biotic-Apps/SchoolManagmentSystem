package com.schoolapp.feature.messages.newthread

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.model.people.StudentSummary

@Immutable
data class NewThreadUiState(
    val isParent: Boolean = false,
    val children: List<ChildSummary> = emptyList(),
    val selectedChildId: String? = null,
    val query: String = "",
    val isSearching: Boolean = false,
    val results: List<StudentSummary> = emptyList(),
    val searchError: AppError? = null,
    val student: StudentSummary? = null,
    val guardians: List<GuardianLink> = emptyList(),
    val isLoadingGuardians: Boolean = false,
    val subject: String = "",
    val body: String = "",
    val studentMissing: Boolean = false,
    val subjectMissing: Boolean = false,
    val bodyMissing: Boolean = false,
    val isSubmitting: Boolean = false,
    val error: AppError? = null,
    /** Set once the server created the thread; the route navigates and clears it. */
    val createdThreadId: String? = null,
) {
    val studentId: String? get() = if (isParent) selectedChildId else student?.id
}

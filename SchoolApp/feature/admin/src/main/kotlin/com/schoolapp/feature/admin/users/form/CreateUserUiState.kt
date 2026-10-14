package com.schoolapp.feature.admin.users.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.users.CreatedUser
import com.schoolapp.feature.admin.common.FieldProblem
import com.schoolapp.feature.admin.users.assignments.AssignmentDraft
import com.schoolapp.feature.admin.users.assignments.AssignmentOptions
import com.schoolapp.feature.admin.users.assignments.AssignmentProblem

@Immutable
data class CreateUserUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val canAdd: Boolean = true,
    val options: AssignmentOptions = AssignmentOptions(),
    val contact: UserContact = UserContact(),
    val password: String = "",
    val assignments: List<AssignmentDraft> = listOf(AssignmentDraft()),
    val errors: Map<UserField, FieldProblem> = emptyMap(),
    val serverErrors: Map<UserField, String> = emptyMap(),
    /** Problems per assignment, by [AssignmentDraft.key]; only filled after a submit attempt. */
    val assignmentProblems: Map<Long, Set<AssignmentProblem>> = emptyMap(),
    val showErrors: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val created: CreatedUser? = null,
    val isDirty: Boolean = false,
) {
    val canAddAssignment: Boolean get() = assignments.size < MAX_ASSIGNMENTS

    companion object {
        /** API CreateUserDto: 1–10 assignments. */
        const val MAX_ASSIGNMENTS = 10
    }
}

package com.schoolapp.feature.admin.users.assignments

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.users.AssignmentRequest

enum class AssignmentProblem { PICK_ROLE, PICK_SCHOOL, PICK_BRANCH, PAST_DATE }

/** One role + scope row being edited; [validUntil] is "yyyy-MM-dd" or empty (permanent). */
@Immutable
data class AssignmentDraft(
    val key: Long = System.nanoTime(),
    val roleKey: String = "",
    val scopeType: String = AssignmentOptions.SCOPE_BRANCH,
    val schoolId: String = "",
    val branchId: String = "",
    val validUntil: String = "",
) {
    /** Keeps the scope valid for the chosen role (web use-assignment-row.ts). */
    fun withRole(roleKey: String, options: AssignmentOptions): AssignmentDraft {
        val scopes = options.scopesFor(roleKey)
        return copy(roleKey = roleKey, scopeType = scopeType.takeIf { it in scopes } ?: scopes.first())
    }

    fun problems(today: String): Set<AssignmentProblem> = buildSet {
        if (roleKey.isBlank()) add(AssignmentProblem.PICK_ROLE)
        if (scopeType == AssignmentOptions.SCOPE_SCHOOL && schoolId.isBlank()) add(AssignmentProblem.PICK_SCHOOL)
        if (scopeType == AssignmentOptions.SCOPE_BRANCH && branchId.isBlank()) add(AssignmentProblem.PICK_BRANCH)
        if (validUntil.isNotBlank() && validUntil <= today) add(AssignmentProblem.PAST_DATE)
    }

    fun toRequest() = AssignmentRequest(
        roleKey = roleKey,
        scopeType = scopeType,
        schoolId = schoolId.takeIf { scopeType == AssignmentOptions.SCOPE_SCHOOL && it.isNotBlank() },
        branchId = branchId.takeIf { scopeType == AssignmentOptions.SCOPE_BRANCH && it.isNotBlank() },
        validUntil = validUntil.takeIf { it.isNotBlank() },
    )
}

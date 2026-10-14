package com.schoolapp.feature.staff.probation

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption

/** "Probation review" sheet (`PUT /staff/:id/probation`), same fields as the web dialog. */
@Immutable
data class ProbationState(
    val staffName: String,
    val requiresReview: Boolean,
    /** User id of the reviewer (a coordinator, head teacher or principal of the branch). */
    val reviewerUserId: String?,
    val reviewers: List<SwitcherOption> = emptyList(),
    val reviewersLoading: Boolean = true,
    val reviewersError: AppError? = null,
    val reviewerMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val noReviewers: Boolean get() = !reviewersLoading && reviewersError == null && reviewers.isEmpty()
}

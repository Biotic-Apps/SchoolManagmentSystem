package com.schoolapp.core.network.dto.staff.assignments

import kotlinx.serialization.Serializable

/** `PUT /staff/:id/probation`; [reviewerUserId] is omitted when review is off. */
@Serializable
data class ProbationRequest(val requiresReview: Boolean, val reviewerUserId: String? = null)

/** `POST /staff/:id/assignments`; only the fields that apply to [kind] are sent (nulls omitted). */
@Serializable
data class NewAssignmentRequest(
    val kind: String,
    val sessionId: String,
    val branchId: String,
    val sectionId: String? = null,
    val subjectId: String? = null,
    val responsibleStaffId: String? = null,
    val validUntil: String? = null,
    val isSubstitute: Boolean? = null,
)

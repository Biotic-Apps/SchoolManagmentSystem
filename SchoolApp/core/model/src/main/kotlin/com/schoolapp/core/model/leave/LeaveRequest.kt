package com.schoolapp.core.model.leave

import com.schoolapp.core.model.common.PersonRef

enum class LeaveKind { STUDENT, STAFF }

enum class LeaveType { CASUAL, SICK, ANNUAL, UNPAID, OTHER }

enum class LeaveStatus { SUBMITTED, APPROVED, REJECTED, CANCELLED }

/** `mine` = filed by the caller; `review` = what the caller may decide. */
enum class LeaveScope { MINE, REVIEW }

data class LeaveRequest(
    val id: String,
    val kind: LeaveKind,
    val subject: PersonRef,
    val from: String,
    val to: String,
    val days: Int,
    val type: LeaveType?,
    val reason: String,
    val status: LeaveStatus,
    val requestedBy: PersonRef?,
    val decidedBy: PersonRef?,
    val comment: String?,
    val createdAt: String?,
)

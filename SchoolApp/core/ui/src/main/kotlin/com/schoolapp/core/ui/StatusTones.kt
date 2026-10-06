package com.schoolapp.core.ui

import com.schoolapp.core.designsystem.component.StatusTone

/** Chip colour for the server's record/workflow status keys, shared by every people and academics screen. */
fun statusTone(status: String?): StatusTone = when (status) {
    in SUCCESS -> StatusTone.Success
    in WARNING -> StatusTone.Warning
    in ERROR -> StatusTone.Error
    in INFO -> StatusTone.Info
    else -> StatusTone.Neutral
}

private val SUCCESS = setOf(
    "ACTIVE", "VERIFIED", "APPROVED", "COMPLETED", "PUBLISHED", "OFFERED", "CONFIRMED", "ENROLLED", "PROMOTED",
)
private val WARNING = setOf(
    "PENDING", "REQUESTED", "SUBMITTED", "WAITLISTED", "IN_PROGRESS", "UPLOADED", "ON_LEAVE",
    "DOCUMENTS_PENDING", "TEST_SCHEDULED", "TEST_COMPLETED", "PENDING_REVIEW", "DELAYED",
)
private val ERROR = setOf("REJECTED", "WITHDRAWN", "TERMINATED", "RESIGNED", "EXPIRED", "REVOKED", "TRANSFERRED_OUT")
private val INFO = setOf("DRAFT", "RETURNED", "DRAFT_REVISION", "TRANSFERRED", "GRADUATED")

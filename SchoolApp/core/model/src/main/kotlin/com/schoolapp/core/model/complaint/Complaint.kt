package com.schoolapp.core.model.complaint

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.files.Attachment

enum class ComplaintCategory { ACADEMIC, STAFF_BEHAVIOUR, FACILITY, TRANSPORT, FEE, SAFETY, OTHER }

enum class ComplaintStatus { SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED, REOPENED }

enum class ComplaintBox { MINE, ASSIGNED, ALL }

data class Complaint(
    val id: String,
    val ticketNo: String,
    val category: ComplaintCategory,
    val subject: String,
    val description: String,
    val status: ComplaintStatus,
    val escalationLevel: Int,
    val slaDueAt: String?,
    val overdue: Boolean,
    /** Null when filed anonymously and the viewer is not principal/super admin. */
    val complainant: PersonRef?,
    val complainantRole: String?,
    val against: PersonRef?,
    val student: PersonRef?,
    val assignee: PersonRef?,
    val updates: List<ComplaintUpdate>,
    val createdAt: String?,
) {
    val isOpen: Boolean get() = status != ComplaintStatus.RESOLVED && status != ComplaintStatus.CLOSED
}

data class ComplaintUpdate(
    val id: String,
    val authorName: String?,
    val message: String,
    val status: ComplaintStatus?,
    val at: String?,
    val attachments: List<Attachment> = emptyList(),
)

package com.schoolapp.core.data.complaints

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintInput
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.settings.PagedList

interface ComplaintsRepository {
    suspend fun complaints(box: ComplaintBox, status: ComplaintStatus? = null): AppResult<List<Complaint>>

    /** One server page (newest first) of a box, optionally filtered by status and category. */
    suspend fun complaintsPage(
        box: ComplaintBox,
        status: ComplaintStatus?,
        category: ComplaintCategory?,
        page: Int,
        pageSize: Int,
    ): AppResult<PagedList<Complaint>>

    suspend fun complaint(id: String): AppResult<Complaint>
    suspend fun file(input: ComplaintInput): AppResult<Complaint>

    /** Supervisor (`complaints.edit`) hands an open complaint to a staff login. */
    suspend fun assign(id: String, assigneeUserId: String): AppResult<Complaint>

    /** Progress note or comment; [status] (assignee only) may move it to IN_PROGRESS or RESOLVED. */
    suspend fun addUpdate(
        id: String,
        message: String,
        status: ComplaintStatus? = null,
        attachmentFileIds: List<String> = emptyList(),
    ): AppResult<Complaint>

    suspend fun escalate(id: String, reason: String?): AppResult<Complaint>
    suspend fun close(id: String, reason: String?): AppResult<Complaint>
    suspend fun reopen(id: String, reason: String?): AppResult<Complaint>
}

package com.schoolapp.feature.complaints

import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintInput
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile

fun complaint(
    status: ComplaintStatus = ComplaintStatus.ASSIGNED,
    complainant: PersonRef? = PersonRef("u9", "Hina"),
    assignee: PersonRef? = PersonRef("u2", "Coordinator"),
    against: PersonRef? = null,
) = Complaint(
    id = "c1", ticketNo = "CMP-2026-1", category = ComplaintCategory.FACILITY, subject = "Broken fan", description = "Room 4",
    status = status, escalationLevel = 0, slaDueAt = "2026-10-08T05:00:00Z", overdue = false,
    complainant = complainant, complainantRole = "PARENT", against = against, student = null, assignee = assignee,
    updates = emptyList(), createdAt = "2026-10-06T05:00:00Z",
)

data class UpdateCall(val id: String, val message: String, val status: ComplaintStatus?, val attachmentFileIds: List<String>)

class FakeComplaintsRepository : ComplaintsRepository {
    val filed = mutableListOf<ComplaintInput>()
    val updates = mutableListOf<UpdateCall>()
    val assigned = mutableListOf<Pair<String, String>>()
    var current: Complaint = complaint()

    override suspend fun complaints(box: ComplaintBox, status: ComplaintStatus?) = AppResult.Success(listOf(complaint()))
    val pageRequests = mutableListOf<Triple<ComplaintBox, ComplaintStatus?, ComplaintCategory?>>()
    override suspend fun complaintsPage(
        box: ComplaintBox,
        status: ComplaintStatus?,
        category: ComplaintCategory?,
        page: Int,
        pageSize: Int,
    ): AppResult<PagedList<Complaint>> {
        pageRequests += Triple(box, status, category)
        return AppResult.Success(PagedList(listOf(complaint()), page, pageSize, 1))
    }
    override suspend fun complaint(id: String) = AppResult.Success(current)
    override suspend fun file(input: ComplaintInput): AppResult<Complaint> {
        filed += input
        return AppResult.Success(complaint())
    }
    override suspend fun assign(id: String, assigneeUserId: String): AppResult<Complaint> {
        assigned += id to assigneeUserId
        current = current.copy(status = ComplaintStatus.ASSIGNED, assignee = PersonRef(assigneeUserId, "Assignee"))
        return AppResult.Success(current)
    }
    override suspend fun addUpdate(id: String, message: String, status: ComplaintStatus?, attachmentFileIds: List<String>): AppResult<Complaint> {
        updates += UpdateCall(id, message, status, attachmentFileIds)
        return AppResult.Success(current)
    }
    override suspend fun escalate(id: String, reason: String?) = AppResult.Success(complaint())
    override suspend fun close(id: String, reason: String?) = AppResult.Success(complaint())
    override suspend fun reopen(id: String, reason: String?) = AppResult.Success(complaint())
}

class FakeFilesRepository : FilesRepository {
    var failWith: AppError? = null
    private var count = 0

    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> {
        failWith?.let { return AppResult.Failure(it) }
        count++
        return AppResult.Success(UploadedFile("f$count", null, "application/pdf", 10, "letter$count.pdf"))
    }
}

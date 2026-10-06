package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.data.complaints.DefaultComplaintsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintInput
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.complaint.ComplaintUpdate
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareComplaintsRepository @Inject constructor(
    private val real: DefaultComplaintsRepository,
    private val auth: DemoAwareAuthRepository,
) : ComplaintsRepository {

    private val role get() = auth.demoSession.value?.activeRole
    private val me: PersonRef get() = DemoActors.forRole(role)

    override suspend fun complaints(box: ComplaintBox, status: ComplaintStatus?): AppResult<List<Complaint>> {
        if (!auth.isDemoActive) return real.complaints(box, status)
        val me = me
        val list = DemoComplaintsData.complaints.value.filter { stored ->
            when (box) {
                ComplaintBox.MINE -> stored.filer == me
                ComplaintBox.ASSIGNED -> stored.complaint.assignee == me
                ComplaintBox.ALL -> true
            } && (status == null || stored.complaint.status == status)
        }
        return AppResult.Success(list.map(::view).sortedByDescending { it.createdAt })
    }

    override suspend fun complaint(id: String): AppResult<Complaint> {
        if (!auth.isDemoActive) return real.complaint(id)
        return find(id)
    }

    override suspend fun file(input: ComplaintInput): AppResult<Complaint> {
        if (!auth.isDemoActive) return real.file(input)
        val me = me
        val n = DemoComplaintsData.complaints.value.size + 1
        val assignee = when {
            role == RoleKey.PARENT && input.category == ComplaintCategory.ACADEMIC -> DemoActors.teacher
            role == RoleKey.PRINCIPAL -> DemoActors.superAdmin
            role == RoleKey.PARENT -> DemoActors.principal
            else -> DemoActors.coordinator
        }
        val student = input.studentId?.let { id -> DemoPeopleData.students.firstOrNull { it.id == id }?.let { PersonRef(it.id, it.name) } }
        val complaint = Complaint(
            id = "demo-cmp-$n",
            ticketNo = "CMP-2026-%04d".format(n),
            category = input.category,
            subject = input.subject,
            description = input.description,
            status = ComplaintStatus.ASSIGNED,
            escalationLevel = 0,
            slaDueAt = DemoDates.isoHoursFromNow(48),
            overdue = false,
            complainant = if (input.anonymous) null else me,
            complainantRole = if (input.anonymous) null else role?.key,
            against = null,
            student = student,
            assignee = assignee,
            updates = emptyList(),
            createdAt = DemoDates.isoNow(),
        )
        DemoComplaintsData.complaints.update { listOf(DemoComplaintsData.Stored(complaint, me, input.anonymous)) + it }
        return find(complaint.id)
    }

    override suspend fun addUpdate(id: String, message: String, status: ComplaintStatus?): AppResult<Complaint> =
        if (auth.isDemoActive) change(id, message, status) { it } else real.addUpdate(id, message, status)

    override suspend fun escalate(id: String, reason: String?): AppResult<Complaint> =
        if (auth.isDemoActive) {
            change(id, reason ?: "Escalated", ComplaintStatus.ESCALATED) { it.copy(escalationLevel = it.escalationLevel + 1, assignee = DemoActors.principal) }
        } else {
            real.escalate(id, reason)
        }

    override suspend fun close(id: String, reason: String?): AppResult<Complaint> =
        if (auth.isDemoActive) change(id, reason ?: "Closed", ComplaintStatus.CLOSED) { it.copy(overdue = false) } else real.close(id, reason)

    override suspend fun reopen(id: String, reason: String?): AppResult<Complaint> =
        if (auth.isDemoActive) change(id, reason ?: "Reopened", ComplaintStatus.REOPENED) { it } else real.reopen(id, reason)

    private fun change(id: String, message: String, status: ComplaintStatus?, transform: (Complaint) -> Complaint): AppResult<Complaint> {
        val author = me.name
        DemoComplaintsData.complaints.update { list ->
            list.map { stored ->
                if (stored.complaint.id != id) return@map stored
                val c = stored.complaint
                val update = ComplaintUpdate("demo-cu-${System.currentTimeMillis()}", author, message, status, DemoDates.isoNow())
                stored.copy(complaint = transform(c.copy(status = status ?: c.status, updates = c.updates + update)))
            }
        }
        return find(id)
    }

    private fun find(id: String): AppResult<Complaint> =
        DemoComplaintsData.complaints.value.firstOrNull { it.complaint.id == id }?.let { AppResult.Success(view(it)) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))

    /** Anonymous complainants are only revealed to the principal and super admin. */
    private fun view(stored: DemoComplaintsData.Stored): Complaint {
        if (!stored.anonymous) return stored.complaint
        val reveal = role == RoleKey.PRINCIPAL || role == RoleKey.SUPER_ADMIN
        return stored.complaint.copy(
            complainant = if (reveal) stored.filer else null,
            complainantRole = if (reveal) "PARENT" else null,
        )
    }
}

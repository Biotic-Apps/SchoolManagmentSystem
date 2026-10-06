package com.schoolapp.demo

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.complaint.ComplaintUpdate
import kotlinx.coroutines.flow.MutableStateFlow

/**
 * Four complaints: SUBMITTED, IN_PROGRESS (assigned to Demo Teacher), RESOLVED and an anonymous ESCALATED overdue one.
 * [Stored.filer] is who filed it, kept even when anonymous so "Mine" works.
 */
internal object DemoComplaintsData {

    data class Stored(val complaint: Complaint, val filer: PersonRef, val anonymous: Boolean)

    private val ayesha = PersonRef(DemoPeopleData.CHILD_1, "Ayesha Khan")

    val complaints = MutableStateFlow(seed())

    private fun complaint(
        n: Int,
        category: ComplaintCategory,
        subject: String,
        description: String,
        status: ComplaintStatus,
        complainant: PersonRef?,
        assignee: PersonRef?,
        createdAt: String,
        slaDueAt: String,
        overdue: Boolean = false,
        level: Int = 0,
        student: PersonRef? = null,
        updates: List<ComplaintUpdate> = emptyList(),
    ) = Complaint(
        "demo-cmp-$n", "CMP-2026-%04d".format(n), category, subject, description, status, level, slaDueAt, overdue,
        complainant, complainant?.let { if (it == DemoActors.parent) "PARENT" else "TEACHER" }, null, student, assignee, updates, createdAt,
    )

    private fun seed(): List<Stored> {
        val today = DemoDates.today()
        val days = DemoDates.previousSchoolDays(8)
        val nowIso = DemoDates.iso(today, "09:00")
        return listOf(
            Stored(
                complaint(
                    1, ComplaintCategory.ACADEMIC, "Too much homework on weekends",
                    "Ayesha gets homework from four subjects every Friday. Could it be spread across the week?",
                    ComplaintStatus.SUBMITTED, DemoActors.parent, null, nowIso, DemoDates.isoHoursFromNow(46), student = ayesha,
                ),
                DemoActors.parent, false,
            ),
            Stored(
                complaint(
                    2, ComplaintCategory.FACILITY, "Fan not working in Room 12",
                    "The second ceiling fan in Room 12 has not worked for a week and the class gets very hot.",
                    ComplaintStatus.IN_PROGRESS, DemoActors.parent, DemoActors.teacher, DemoDates.iso(days[1], "08:30"),
                    DemoDates.isoHoursFromNow(10), student = ayesha,
                    updates = listOf(
                        ComplaintUpdate("demo-cu-1", DemoActors.teacher.name, "Reported to the maintenance staff.", ComplaintStatus.IN_PROGRESS, DemoDates.iso(days[0], "10:15")),
                    ),
                ),
                DemoActors.parent, false,
            ),
            Stored(
                complaint(
                    3, ComplaintCategory.TRANSPORT, "Van arriving late",
                    "The school van on the Model Town route has been 20 minutes late three days in a row.",
                    ComplaintStatus.RESOLVED, DemoActors.parent, DemoActors.coordinator, DemoDates.iso(days[6], "07:50"),
                    DemoDates.iso(days[4], "07:50"), student = PersonRef(DemoPeopleData.CHILD_2, "Omar Khan"),
                    updates = listOf(
                        ComplaintUpdate("demo-cu-2", DemoActors.coordinator.name, "Spoke to the transport contractor.", ComplaintStatus.IN_PROGRESS, DemoDates.iso(days[5], "11:00")),
                        ComplaintUpdate("demo-cu-3", DemoActors.coordinator.name, "Route timing changed; van now arrives by 7:30 AM.", ComplaintStatus.RESOLVED, DemoDates.iso(days[4], "12:30")),
                    ),
                ),
                DemoActors.parent, false,
            ),
            Stored(
                complaint(
                    4, ComplaintCategory.SAFETY, "Gate left open during school hours",
                    "The side gate near the canteen is often left open while classes are running.",
                    ComplaintStatus.ESCALATED, null, DemoActors.principal, DemoDates.iso(days[4], "12:05"),
                    DemoDates.iso(days[2], "12:05"), overdue = true, level = 1,
                    updates = listOf(
                        ComplaintUpdate("demo-cu-4", "System", "Escalated to the principal: response time passed.", ComplaintStatus.ESCALATED, DemoDates.iso(days[2], "13:00")),
                    ),
                ),
                PersonRef("demo-g-3", "Tariq Noor"), true,
            ),
        )
    }
}

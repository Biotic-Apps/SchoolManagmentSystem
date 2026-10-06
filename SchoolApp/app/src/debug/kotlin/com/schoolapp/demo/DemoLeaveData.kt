package com.schoolapp.demo

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.model.leave.LeaveType
import kotlinx.coroutines.flow.MutableStateFlow
import java.time.LocalDate
import java.time.temporal.ChronoUnit

/** One student leave (Omar, SUBMITTED) and one staff leave (Demo Teacher, SUBMITTED). */
internal object DemoLeaveData {

    val leaves = MutableStateFlow(seed())

    fun days(from: String, to: String): Int =
        runCatching { ChronoUnit.DAYS.between(LocalDate.parse(from), LocalDate.parse(to)).toInt() + 1 }.getOrDefault(1)

    private fun seed(): List<LeaveRequest> {
        val next = DemoDates.nextSchoolDays(6)
        val omarFrom = next[1].toString()
        val omarTo = next[2].toString()
        val staffFrom = next[4].toString()
        val staffTo = next[5].toString()
        return listOf(
            LeaveRequest(
                id = "demo-lv-1",
                kind = LeaveKind.STUDENT,
                subject = PersonRef(DemoPeopleData.CHILD_2, "Omar Khan"),
                from = omarFrom,
                to = omarTo,
                days = days(omarFrom, omarTo),
                type = null,
                reason = "Family wedding in Faisalabad",
                status = LeaveStatus.SUBMITTED,
                requestedBy = DemoActors.parent,
                decidedBy = null,
                comment = null,
                createdAt = DemoDates.iso(DemoDates.today(), "07:45"),
            ),
            LeaveRequest(
                id = "demo-lv-2",
                kind = LeaveKind.STAFF,
                subject = DemoActors.teacher,
                from = staffFrom,
                to = staffTo,
                days = days(staffFrom, staffTo),
                type = LeaveType.CASUAL,
                reason = "Personal work at the passport office",
                status = LeaveStatus.SUBMITTED,
                requestedBy = DemoActors.teacher,
                decidedBy = null,
                comment = null,
                createdAt = DemoDates.iso(DemoDates.previousSchoolDays(1).first(), "15:10"),
            ),
        )
    }
}

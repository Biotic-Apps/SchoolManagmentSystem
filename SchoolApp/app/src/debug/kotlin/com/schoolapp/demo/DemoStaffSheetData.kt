package com.schoolapp.demo

import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StaffAttendanceSheet
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.model.attendance.StaffRosterEntry
import java.util.concurrent.ConcurrentHashMap

/** Branch staff register for the demo: past school days are fully marked, today starts empty. */
internal object DemoStaffSheetData {

    private val saved = ConcurrentHashMap<String, Map<String, StaffMark>>()

    fun sheet(branchId: String, date: String): StaffAttendanceSheet {
        val marks = saved[date] ?: seed(date)
        val entries = DemoStaffData.staff.sortedBy { it.name }.map { s ->
            val mark = marks[s.id]
            StaffRosterEntry(s.id, s.name, s.designation, s.photoUrl, mark?.status, mark?.checkIn, mark?.checkOut, mark?.remark)
        }
        return StaffAttendanceSheet(branchId, date, entries)
    }

    fun save(branchId: String, date: String, marks: List<StaffMark>): StaffAttendanceSheet {
        saved[date] = (saved[date] ?: seed(date)) + marks.associateBy { it.staffId }
        return sheet(branchId, date)
    }

    private fun seed(date: String): Map<String, StaffMark> {
        if (date >= DemoDates.todayKey()) return emptyMap()
        return DemoStaffData.staff.mapIndexed { index, s ->
            when (index) {
                2 -> StaffMark(s.id, AttendanceStatus.LATE, "08:20", "14:00", "Traffic")
                4 -> StaffMark(s.id, AttendanceStatus.LEAVE)
                else -> StaffMark(s.id, AttendanceStatus.PRESENT, "07:50", "14:00")
            }
        }.associateBy { it.staffId }
    }
}

package com.schoolapp.demo

import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.AttendanceSummary
import com.schoolapp.core.model.attendance.MyStaffAttendance
import com.schoolapp.core.model.attendance.StaffAttendanceDay

/** The previewing staff member's own last 10 school days. */
internal object DemoStaffAttendanceData {

    fun mine(from: String?, to: String?): MyStaffAttendance {
        val days = DemoDates.previousSchoolDays(10).mapIndexed { index, day ->
            when (index) {
                3 -> StaffAttendanceDay(day.toString(), AttendanceStatus.LATE, "08:12", "14:05", "Traffic on Canal Road")
                7 -> StaffAttendanceDay(day.toString(), AttendanceStatus.LEAVE, null, null, "Casual leave")
                else -> StaffAttendanceDay(day.toString(), AttendanceStatus.PRESENT, "07:5$index", "14:0$index", null)
            }
        }.filter { DemoDates.inRange(it.date, from, to) }
        val present = days.count { it.status == AttendanceStatus.PRESENT }
        val late = days.count { it.status == AttendanceStatus.LATE }
        val leave = days.count { it.status == AttendanceStatus.LEAVE }
        val percent = if (days.isEmpty()) 0 else (present + late) * 100 / days.size
        return MyStaffAttendance(days, AttendanceSummary(present, 0, late, leave, 0, 0, percent))
    }
}

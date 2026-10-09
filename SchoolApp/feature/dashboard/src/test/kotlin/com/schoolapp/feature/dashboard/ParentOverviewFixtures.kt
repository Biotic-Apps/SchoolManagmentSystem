package com.schoolapp.feature.dashboard

import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.dashboard.AttendanceMonth
import com.schoolapp.core.model.dashboard.ChildAttendance
import com.schoolapp.core.model.dashboard.ChildBrief
import com.schoolapp.core.model.dashboard.HomeworkDue
import com.schoolapp.core.model.dashboard.ParentOverview
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.timetable.TeacherSlot

fun parentOverview(
    attendance: AttendanceStatus? = null,
    notices: List<Notice> = emptyList(),
    consentsPending: Int = 0,
    fees: FeeSummary? = null,
    periods: List<TeacherSlot> = emptyList(),
) = ParentOverview(
    child = ChildBrief("c1", "Ayesha Khan", null, "BS-1", "Class 5", "A", 7, "Main", null, "Sara Ali", "u9"),
    attendance = ChildAttendance(attendance, AttendanceMonth("2026-10", 4, 1, 0, 0, 0, 80.0)),
    fees = fees,
    latestResult = null,
    homework = HomeworkDue(0, null),
    todayPeriods = periods,
    diary = emptyList(),
    notices = notices,
    meetings = emptyList(),
    events = emptyList(),
    consentsPending = consentsPending,
)

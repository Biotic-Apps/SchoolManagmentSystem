package com.schoolapp.core.data.dashboard

import com.schoolapp.core.data.diary.toModel
import com.schoolapp.core.data.fees.toModel
import com.schoolapp.core.data.meetings.toModel
import com.schoolapp.core.data.notices.ordered
import com.schoolapp.core.data.notices.toModel
import com.schoolapp.core.data.timetable.toModel
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.dashboard.AttendanceMonth
import com.schoolapp.core.model.dashboard.ChildAttendance
import com.schoolapp.core.model.dashboard.ChildBrief
import com.schoolapp.core.model.dashboard.HomeworkDue
import com.schoolapp.core.model.dashboard.LatestResult
import com.schoolapp.core.model.dashboard.ParentOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.network.dto.dashboard.AttendanceMonthDto
import com.schoolapp.core.network.dto.dashboard.LatestResultDto
import com.schoolapp.core.network.dto.dashboard.ParentChildDto
import com.schoolapp.core.network.dto.dashboard.ParentEventDto
import com.schoolapp.core.network.dto.dashboard.ParentHomeDto

/** UNMARKED (or anything unknown) maps to null: "not marked yet", never absent. */
internal fun ParentHomeDto.toModel() = ParentOverview(
    child = child.toModel(),
    attendance = ChildAttendance(AttendanceStatus.fromKey(attendance?.today), attendance?.month?.toModel()),
    fees = fees?.toModel(),
    latestResult = latestResult?.toModel(),
    homework = HomeworkDue(homework?.dueCount ?: 0, homework?.nextDueDate),
    todayPeriods = todayPeriods.map { it.toModel() }.sortedBy { it.periodIndex },
    diary = diary.map { it.toModel() },
    notices = notices.map { it.toModel() }.ordered(),
    meetings = meetings.map { it.toModel() },
    events = events.map { it.toModel() },
    consentsPending = consentsPending,
)

internal fun ParentChildDto.toModel() = ChildBrief(
    id = id,
    name = name,
    photoUrl = photoUrl?.takeIf { it.isNotBlank() },
    admissionNo = admissionNo?.takeIf { it.isNotBlank() },
    className = className,
    sectionName = sectionName,
    rollNo = rollNo,
    branchName = branchName,
    branchPhone = branchPhone?.takeIf { it.isNotBlank() },
    classTeacherName = classTeacher?.name?.takeIf { it.isNotBlank() },
    classTeacherUserId = classTeacher?.userId,
)

internal fun AttendanceMonthDto.toModel() = AttendanceMonth(month, present, absent, late, leave, halfDay, percent)

internal fun LatestResultDto.toModel() = LatestResult(examId, examName, percent, grade, position, passed, publishedAt)

internal fun ParentEventDto.toModel() = CalendarEvent(
    id = id,
    type = kind,
    title = title,
    startDate = startDate,
    endDate = endDate,
    description = null,
)

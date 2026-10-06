package com.schoolapp.core.data.dashboard

import com.schoolapp.core.data.common.sectionLabel
import com.schoolapp.core.data.diary.toModel
import com.schoolapp.core.data.meetings.toModel
import com.schoolapp.core.data.notices.ordered
import com.schoolapp.core.data.notices.toModel
import com.schoolapp.core.data.timetable.toModel
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.dashboard.PendingDiarySlot
import com.schoolapp.core.model.dashboard.SectionRegisterState
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.network.dto.dashboard.ChildTodayDto
import com.schoolapp.core.network.dto.dashboard.DiaryPendingDto
import com.schoolapp.core.network.dto.dashboard.RegisterStateDto
import com.schoolapp.core.network.dto.dashboard.TeacherTodayDto

internal fun TeacherTodayDto.toModel() = TeacherToday(
    periods = periods.map { it.toModel() }.sortedBy { it.periodIndex },
    registers = registers.mapNotNull { it.toModel() },
    diariesPending = diariesPending.mapNotNull { it.toModel() },
    unreadMessages = unreadMessages,
    assignedComplaints = assignedComplaints,
)

internal fun RegisterStateDto.toModel(): SectionRegisterState? {
    val id = sectionId ?: section?.id ?: return null
    return SectionRegisterState(id, sectionLabel(className ?: section?.className, sectionName ?: section?.name), RegisterStatus.fromKey(status))
}

internal fun DiaryPendingDto.toModel(): PendingDiarySlot? {
    val id = sectionId ?: section?.id ?: return null
    return PendingDiarySlot(
        sectionId = id,
        sectionLabel = sectionLabel(className ?: section?.className, sectionName ?: section?.name),
        subjectId = subjectId ?: subject?.id,
        subjectName = subjectName ?: subject?.name,
    )
}

internal fun ChildTodayDto.toModel() = ChildToday(
    attendance = AttendanceStatus.fromKey(attendance?.status),
    diary = diary.map { it.toModel() },
    notices = notices.map { it.toModel() }.ordered(),
    consentsPending = consentsPending,
    nextMeeting = nextMeeting?.toModel(),
)

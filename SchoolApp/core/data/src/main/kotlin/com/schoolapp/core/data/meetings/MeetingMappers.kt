package com.schoolapp.core.data.meetings

import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.FollowUpStatus
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.core.network.dto.meeting.CompleteMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.FollowUpBodyDto
import com.schoolapp.core.network.dto.meeting.FollowUpDto
import com.schoolapp.core.network.dto.meeting.MeetingDto
import com.schoolapp.core.network.dto.meeting.MeetingSlotDto

internal fun MeetingDto.toModel() = Meeting(
    id = id,
    student = student?.toRef(),
    guardian = guardian?.toRef(),
    staff = staff?.toRef(),
    date = date,
    startTime = startTime,
    endTime = endTime,
    mode = enumOrDefault(mode, MeetingMode.IN_PERSON),
    location = location,
    agenda = agenda,
    status = enumOrDefault(status, MeetingStatus.SCHEDULED),
    notes = notes,
    summary = summary,
    followUps = followUps.map { it.toModel() },
)

internal fun MeetingSlotDto.toModel() = MeetingSlot(
    id = id,
    staff = staff?.toRef(),
    date = date,
    startTime = startTime,
    endTime = endTime,
    mode = enumOrDefault(mode, MeetingMode.IN_PERSON),
    location = location,
    status = status,
)

internal fun FollowUpDto.toModel() = FollowUp(
    id = id,
    title = title,
    ownerName = owner?.name,
    dueDate = dueDate,
    status = enumOrDefault(status, FollowUpStatus.OPEN),
    studentName = student?.name,
)

internal fun CompleteMeetingInput.toBody() = CompleteMeetingBodyDto(
    notes = notes.trim(),
    shareSummaryWithParent = shareSummaryWithParent,
    summary = summary.clean(),
    followUps = followUps.map { FollowUpBodyDto(it.title.trim(), it.ownerUserId, it.dueDate) }.takeIf { it.isNotEmpty() },
)

/** Chronological order by date then start time. */
internal fun List<Meeting>.chronological(): List<Meeting> = sortedWith(compareBy({ it.date }, { it.startTime }))

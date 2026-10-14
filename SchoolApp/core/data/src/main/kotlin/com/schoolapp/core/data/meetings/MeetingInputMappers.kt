package com.schoolapp.core.data.meetings

import com.schoolapp.core.model.meeting.AcceptMeetingInput
import com.schoolapp.core.model.meeting.StaffMeetingInput
import com.schoolapp.core.network.dto.meeting.AcceptMeetingBodyDto
import com.schoolapp.core.network.dto.meeting.StaffMeetingBodyDto

internal fun AcceptMeetingInput.toBody() = AcceptMeetingBodyDto(
    date = date,
    startTime = startTime,
    endTime = endTime,
    mode = mode.name,
    location = location?.trim()?.takeIf { it.isNotEmpty() },
)

internal fun StaffMeetingInput.toBody() = StaffMeetingBodyDto(
    studentId = studentId,
    guardianId = guardianId,
    date = date,
    startTime = startTime,
    endTime = endTime,
    mode = mode.name,
    agenda = agenda.trim(),
    location = location?.trim()?.takeIf { it.isNotEmpty() },
)

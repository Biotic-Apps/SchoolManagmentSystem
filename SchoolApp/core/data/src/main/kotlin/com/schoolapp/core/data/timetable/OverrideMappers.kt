package com.schoolapp.core.data.timetable

import com.schoolapp.core.model.timetable.OverrideInput
import com.schoolapp.core.model.timetable.TimetableOverride
import com.schoolapp.core.network.dto.timetable.CreateOverrideRequest
import com.schoolapp.core.network.dto.timetable.TimetableOverrideDto

internal fun TimetableOverrideDto.toModel() = TimetableOverride(
    id = id,
    sectionId = sectionId,
    date = date.take(DATE_LENGTH),
    periodIndex = periodIndex,
    substituteStaffId = substituteStaff?.id ?: substituteStaffId,
    substituteName = substituteStaff?.name?.takeIf { it.isNotBlank() },
    originalTeacherName = originalStaff?.name?.takeIf { it.isNotBlank() },
    reason = reason?.takeIf { it.isNotBlank() },
    className = className?.takeIf { it.isNotBlank() },
    sectionName = sectionName?.takeIf { it.isNotBlank() },
)

internal fun OverrideInput.toRequest() = CreateOverrideRequest(
    sectionId = sectionId,
    date = date,
    periodIndex = periodIndex,
    substituteStaffId = substituteStaffId,
    reason = reason.trim(),
)

private const val DATE_LENGTH = 10

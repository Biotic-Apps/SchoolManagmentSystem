package com.schoolapp.core.data.organisation

import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchTimings
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.network.dto.organisation.AcademicSessionDto
import com.schoolapp.core.network.dto.organisation.BranchDto
import com.schoolapp.core.network.dto.organisation.CalendarEventDto
import com.schoolapp.core.network.dto.organisation.SchoolClassDto
import com.schoolapp.core.network.dto.organisation.SectionDto
import com.schoolapp.core.network.dto.organisation.SubjectDto

internal fun BranchDto.toModel() = Branch(
    id = id,
    schoolId = schoolId,
    schoolName = schoolName,
    code = code,
    name = name,
    address = address,
    phone = phone,
    email = email,
    timings = timings?.let { BranchTimings(it.opensAt, it.closesAt, it.attendanceLockAt, it.staffArrivesAt, it.staffLeavesAt) },
    workingDays = workingDays.sorted(),
    principalName = principal?.name,
    status = status,
)

internal fun AcademicSessionDto.toModel() =
    AcademicSession(id, branchId, name, startDate, endDate, status, termCount)

internal fun CalendarEventDto.toModel() = CalendarEvent(id, type, title, startDate, endDate, description)

internal fun SchoolClassDto.toModel() = SchoolClass(id, name, levelOrder, subjectCount)

internal fun SectionDto.toModel() =
    Section(id, classId, className, name, capacity, room?.name, studentCount, status)

internal fun SubjectDto.toModel() = Subject(id, code, name)

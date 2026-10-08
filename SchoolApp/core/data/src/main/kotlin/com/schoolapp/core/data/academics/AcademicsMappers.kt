package com.schoolapp.core.data.academics

import com.schoolapp.core.model.academics.AllocationCell
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.model.academics.NamedRef
import com.schoolapp.core.model.academics.Room
import com.schoolapp.core.model.academics.SetupSection
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.network.dto.academics.ClassSubjectDto
import com.schoolapp.core.network.dto.academics.RoomDto
import com.schoolapp.core.network.dto.academics.TeachingStaffDto
import com.schoolapp.core.network.dto.allocation.ClassSetupDto
import com.schoolapp.core.network.dto.allocation.SetupSectionDto
import com.schoolapp.core.network.dto.allocation.SetupSubjectDto
import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.organisation.SubjectDto

/** `{ id, name }` with an id, else null. */
internal fun IdNameDto?.toNamedRef(): NamedRef? = this?.id?.let { NamedRef(it, name.orEmpty()) }

internal fun ClassSetupDto.toSetup() = ClassSetup(
    classId = schoolClass.id.orEmpty(),
    className = schoolClass.name.orEmpty(),
    levelOrder = schoolClass.levelOrder,
    branchId = branchId,
    sessionId = sessionId,
    sections = sections.map { it.toSection() }.sortedBy { it.name },
    subjects = subjects.sortedBy { it.sortOrder }.map { it.toSubject() },
    allocation = allocation.mapNotNull { row ->
        row.subjectId?.let { AllocationCell(row.sectionId, it, row.staff.toNamedRef(), row.placed) }
    },
    groups = groups,
    canEditStructure = canEditStructure,
    canAllocate = canAllocate,
)

private fun SetupSectionDto.toSection() = SetupSection(
    id = id,
    name = name,
    group = group?.takeIf { it.isNotBlank() },
    studentCount = studentCount,
    capacity = capacity,
    room = room.toNamedRef(),
    classTeacher = classTeacher.toNamedRef(),
    timetable = TimetableState.parse(timetable),
)

private fun SetupSubjectDto.toSubject() =
    ClassSubject(subjectId, code, name, periodsPerWeek, isOptional, group?.takeIf { it.isNotBlank() })

internal fun ClassSubjectDto.toSubject() =
    ClassSubject(subjectId, code, name, periodsPerWeek, isOptional, group?.takeIf { it.isNotBlank() })

internal fun TeachingStaffDto.toModel() =
    TeachingStaff(id, name, designation, hasLogin, allocatedPeriods, placedPeriods, sections)

internal fun RoomDto.toModel() = Room(id, name, capacity)

internal fun SubjectDto.toCatalogue() = CatalogueSubject(id, code, name)

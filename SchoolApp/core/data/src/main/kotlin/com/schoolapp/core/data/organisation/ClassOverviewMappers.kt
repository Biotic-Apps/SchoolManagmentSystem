package com.schoolapp.core.data.organisation

import com.schoolapp.core.model.organisation.ClassIssue
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.ClassSubjectRef
import com.schoolapp.core.model.organisation.SectionOverview
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.network.dto.organisation.ClassOverviewDto
import com.schoolapp.core.network.dto.organisation.ClassSubjectRefDto
import com.schoolapp.core.network.dto.organisation.SchoolClassDto
import com.schoolapp.core.network.dto.organisation.SectionDto
import com.schoolapp.core.network.dto.organisation.SectionOverviewDto

internal fun ClassOverviewDto.toModel() = ClassOverview(
    id = id,
    name = name,
    levelOrder = levelOrder,
    status = status,
    studentCount = studentCount,
    capacity = capacity,
    sections = sections.map { it.toModel() }.sortedBy { it.name },
    subjects = subjects.map { it.toModel() },
    subjectCount = subjects.size,
    issues = issues.mapNotNull(ClassIssue::parse),
    unallocated = unallocated,
)

internal fun SectionOverviewDto.toModel() = SectionOverview(
    id = id,
    name = name,
    group = group,
    studentCount = studentCount,
    capacity = capacity,
    roomName = room?.name,
    classTeacherName = classTeacher?.name,
    timetable = TimetableState.parse(timetable),
)

internal fun ClassSubjectRefDto.toModel() = ClassSubjectRef(id, name, periodsPerWeek, group)

/**
 * Older servers: build the cards from `/classes` and `/sections`. Subjects are only counted there, so
 * subject names, allocation and timetable state are unknown and no issues except "no sections" are raised.
 */
internal fun overviewFromLists(classes: List<SchoolClassDto>, sections: List<SectionDto>): List<ClassOverview> {
    val byClass = sections.filter { it.status == null || it.status == "ACTIVE" }.groupBy { it.classId }
    return classes.sortedBy { it.levelOrder ?: Int.MAX_VALUE }.map { schoolClass ->
        val own = byClass[schoolClass.id].orEmpty().sortedBy { it.name }
        val capacities = own.mapNotNull { it.capacity }
        ClassOverview(
            id = schoolClass.id,
            name = schoolClass.name,
            levelOrder = schoolClass.levelOrder,
            status = null,
            studentCount = own.sumOf { it.studentCount },
            capacity = capacities.takeIf { it.isNotEmpty() }?.sum(),
            sections = own.map {
                SectionOverview(it.id, it.name, null, it.studentCount, it.capacity, it.room?.name, it.classTeacher?.name, null)
            },
            subjects = emptyList(),
            subjectCount = schoolClass.subjectCount,
            issues = if (own.isEmpty()) listOf(ClassIssue.NO_SECTIONS) else emptyList(),
            unallocated = 0,
        )
    }
}

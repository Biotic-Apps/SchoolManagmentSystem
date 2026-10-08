package com.schoolapp.core.data.staff

import com.schoolapp.core.model.staff.AllocationSection
import com.schoolapp.core.model.staff.AllocationSubject
import com.schoolapp.core.model.staff.AllocationTeacher
import com.schoolapp.core.model.staff.ClassAllocation
import com.schoolapp.core.network.dto.allocation.ClassSetupDto
import com.schoolapp.core.network.dto.common.IdNameDto

private fun IdNameDto?.toTeacher(): AllocationTeacher? = this?.id?.let { AllocationTeacher(it, name.orEmpty()) }

internal fun ClassSetupDto.toModel() = ClassAllocation(
    classId = schoolClass.id.orEmpty(),
    className = schoolClass.name.orEmpty(),
    sections = sections.map { AllocationSection(it.id, it.name, it.group, it.classTeacher.toTeacher()) },
    subjects = subjects.sortedBy { it.sortOrder }.map { AllocationSubject(it.subjectId, it.name, it.group) },
    subjectTeachers = allocation.mapNotNull { row ->
        val subjectId = row.subjectId ?: return@mapNotNull null
        row.staff.toTeacher()?.let { (row.sectionId to subjectId) to it }
    }.toMap(),
    canAllocate = canAllocate,
)

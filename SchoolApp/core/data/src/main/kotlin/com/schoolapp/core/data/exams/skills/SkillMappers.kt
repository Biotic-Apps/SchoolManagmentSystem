package com.schoolapp.core.data.exams.skills

import com.schoolapp.core.model.exams.SkillDomain
import com.schoolapp.core.model.exams.SkillGrid
import com.schoolapp.core.model.exams.SkillItem
import com.schoolapp.core.model.exams.SkillLevel
import com.schoolapp.core.model.exams.SkillRating
import com.schoolapp.core.model.exams.SkillStudent
import com.schoolapp.core.network.dto.exams.SkillGridDto
import com.schoolapp.core.network.dto.exams.SkillRatingDto

internal fun SkillGridDto.toModel(): SkillGrid = SkillGrid(
    examId = examId,
    sectionId = sectionId,
    editable = editable,
    items = items.map { item ->
        SkillItem(item.id, if (item.domain == "PSYCHOMOTOR") SkillDomain.PSYCHOMOTOR else SkillDomain.AFFECTIVE, item.name)
    },
    scale = scale.map { SkillLevel(it.value, it.code, it.label) }.sortedByDescending { it.value },
    students = students.map { SkillStudent(it.studentId, it.name, it.rollNo, it.ratings) },
    complete = complete,
)

internal fun SkillRating.toDto() = SkillRatingDto(studentId, itemId, value)

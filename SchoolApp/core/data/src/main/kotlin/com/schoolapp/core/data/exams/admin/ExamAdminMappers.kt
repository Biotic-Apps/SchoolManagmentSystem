package com.schoolapp.core.data.exams.admin

import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.admin.ExamConflict
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.admin.ExamInput
import com.schoolapp.core.model.exams.admin.ExamPaper
import com.schoolapp.core.model.exams.admin.ExamPrintInput
import com.schoolapp.core.model.exams.admin.SchedulePaperInput
import com.schoolapp.core.network.dto.exams.admin.ExamCreateBodyDto
import com.schoolapp.core.network.dto.exams.admin.ExamDetailDto
import com.schoolapp.core.network.dto.exams.admin.ExamPaperDto
import com.schoolapp.core.network.dto.exams.admin.ExamPrintBodyDto
import com.schoolapp.core.network.dto.exams.admin.ExamUpdateBodyDto
import com.schoolapp.core.network.dto.exams.admin.SchedulePaperBodyDto
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

internal fun ExamDetailDto.toModel(): ExamDetail {
    val classRefs = classes.mapNotNull { it.toRef() }
        .ifEmpty { classIds.map { PersonRef(it, "") } }
    return ExamDetail(
        id = id,
        branchId = branchId,
        sessionId = sessionId,
        termId = termId,
        name = name,
        type = enumOrNull<ExamType>(type),
        status = enumOrDefault(status, ExamStatus.DRAFT),
        gradingScheme = gradingScheme?.toRef() ?: gradingSchemeId?.let { PersonRef(it, "") },
        weightPercent = weightPercent,
        classes = classRefs,
        approvalId = approvalId,
        computedAt = computedAt,
        publishedAt = publishedAt,
        papers = papers.map { it.toModel() }.sortedWith(compareBy({ it.date }, { it.startTime }, { it.className })),
    )
}

private fun ExamPaperDto.toModel() = ExamPaper(
    id = id,
    classId = classId,
    className = className.orEmpty(),
    subjectId = subject?.id ?: subjectId.orEmpty(),
    subjectName = subject?.name ?: subjectName.orEmpty(),
    date = date.take(DATE_LENGTH),
    startTime = startTime.take(TIME_LENGTH),
    endTime = endTime.take(TIME_LENGTH),
    maxMarks = maxMarks.toInt(),
    passMarks = passMarks.toInt(),
    roomId = roomId,
)

internal fun ExamInput.toCreateBody() = ExamCreateBodyDto(
    branchId = branchId,
    sessionId = sessionId,
    termId = termId,
    name = name.trim(),
    type = type.name,
    gradingSchemeId = gradingSchemeId,
    weightPercent = weightPercent,
    classIds = classIds,
)

internal fun ExamInput.toUpdateBody() = ExamUpdateBodyDto(
    termId = termId,
    name = name.trim(),
    type = type.name,
    gradingSchemeId = gradingSchemeId,
    weightPercent = weightPercent,
    classIds = classIds,
)

internal fun SchedulePaperInput.toBody() = SchedulePaperBodyDto(
    classId = classId,
    subjectId = subjectId,
    date = date,
    startTime = startTime,
    endTime = endTime,
    maxMarks = maxMarks,
    passMarks = passMarks,
    roomId = roomId,
)

internal fun ExamPrintInput.toBody() = ExamPrintBodyDto(
    kind = kind.name,
    sectionId = sectionId,
    classId = classId,
    subjectId = subjectId,
    templateId = templateId,
)

/** 409 details: an array, or an object holding one; strings or `{ className, sectionName, subject, status, message }`. */
internal fun JsonElement.toConflicts(): List<ExamConflict> {
    val list = when (this) {
        is JsonArray -> this
        is JsonObject -> values.firstOrNull { it is JsonArray } as? JsonArray ?: return emptyList()
        else -> return emptyList()
    }
    return list.mapIndexed { index, item -> item.toConflict(index) }
}

private fun JsonElement.toConflict(index: Int): ExamConflict {
    if (this is JsonPrimitive) return ExamConflict(content)
    val raw = this as? JsonObject ?: return ExamConflict("#${index + 1}")
    val paper = raw["paper"] as? JsonObject
    val parts = listOfNotNull(
        raw.text("className") ?: paper?.text("className"),
        raw.text("sectionName") ?: raw.text("section"),
        raw.text("subjectName") ?: raw.text("subject") ?: paper?.text("subject"),
    )
    val label = parts.joinToString(" · ").ifEmpty { raw.text("message") ?: raw.text("reason") ?: "#${index + 1}" }
    return ExamConflict(
        label = if (parts.isNotEmpty()) listOfNotNull(label, raw.text("message")).joinToString(": ") else label,
        status = raw.text("status"),
        classId = raw.text("classId"),
        subjectId = raw.text("subjectId"),
        date = raw.text("date"),
    )
}

private fun JsonObject.text(key: String): String? = when (val value = this[key]) {
    is JsonPrimitive -> value.content.takeIf { value.isString && it.isNotBlank() }
    is JsonObject -> (value["name"] as? JsonPrimitive)?.content?.takeIf { it.isNotBlank() }
    else -> null
}

private const val DATE_LENGTH = 10
private const val TIME_LENGTH = 5

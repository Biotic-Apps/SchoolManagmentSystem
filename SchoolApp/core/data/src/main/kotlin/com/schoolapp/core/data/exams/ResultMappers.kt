package com.schoolapp.core.data.exams

import com.schoolapp.core.data.common.arrayAt
import com.schoolapp.core.data.common.decodeEach
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.exams.ChildResults
import com.schoolapp.core.model.exams.ReportCard
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.core.model.exams.SubjectResult
import com.schoolapp.core.model.exams.TrendPoint
import com.schoolapp.core.network.dto.exams.ReportCardDto
import com.schoolapp.core.network.dto.exams.StudentResultDto
import com.schoolapp.core.network.dto.exams.SubjectResultDto
import com.schoolapp.core.network.dto.exams.TrendPointDto
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

internal fun StudentResultDto.toModel() = StudentResult(
    studentId = studentId,
    name = name,
    rollNo = rollNo,
    examId = examId.ifBlank { exam?.id.orEmpty() },
    examName = examName ?: exam?.name.orEmpty(),
    publishedAt = publishedAt,
    subjects = subjects.map { it.toModel() },
    totalMarks = totalMarks,
    maxTotal = maxTotal,
    percent = percent,
    grade = grade,
    position = position,
    passed = passed,
    remarks = remarks?.takeIf { it.isNotBlank() },
    teacherRemark = teacherRemark?.takeIf { it.isNotBlank() },
    classId = classId,
    sectionId = sectionId,
)

private fun SubjectResultDto.toModel() = SubjectResult(
    subjectId = subjectId,
    name = name,
    marks = if (absent) null else marks,
    maxMarks = maxMarks,
    absent = absent,
    grade = grade,
    passed = passed,
)

/**
 * `GET /students/:id/results` as `{ results, trend }` or a plain array of results. Without a trend the
 * percentages of the results themselves are used (oldest first).
 */
internal fun JsonElement.toChildResults(json: Json): ChildResults {
    val results = json.decodeEach(arrayAt("results", "items"), StudentResultDto.serializer())
        .map { it.toModel() }
        .sortedByDescending { it.publishedAt.orEmpty() }
    // A plain array has no trend (arrayAt would return the results array itself).
    val trendElements = if (this is JsonObject) arrayAt("trend") else emptyList()
    val trend = json.decodeEach(trendElements, TrendPointDto.serializer())
        .map { TrendPoint(it.examId, it.examName ?: it.name.orEmpty(), it.percent) }
        .ifEmpty { results.reversed().map { TrendPoint(it.examId, it.examName, it.percent) } }
    return ChildResults(results, trend)
}

internal fun ReportCardDto.toModel() = ReportCard(
    status = enumOrNull<ReportCardStatus>(status) ?: if (fileUrl != null) ReportCardStatus.READY else ReportCardStatus.PENDING,
    fileUrl = fileUrl,
    generatedAt = generatedAt,
)

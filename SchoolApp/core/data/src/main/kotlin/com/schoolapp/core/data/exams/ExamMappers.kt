package com.schoolapp.core.data.exams

import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkRow
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.network.dto.exams.ExamDto
import com.schoolapp.core.network.dto.exams.MarkInputDto
import com.schoolapp.core.network.dto.exams.MarkRowDto
import com.schoolapp.core.network.dto.exams.MarkSheetDto

internal fun ExamDto.toModel() = Exam(
    id = id,
    name = name,
    type = enumOrNull<ExamType>(type),
    status = enumOrDefault(status, ExamStatus.DRAFT),
    termName = termName ?: term?.name,
)

internal fun MarkSheetDto.toModel(examName: String? = null): MarkSheet {
    val rowModels = rows.orEmpty().map { it.toModel() }.sortedWith(compareBy(nullsLast()) { it.rollNo })
    return MarkSheet(
        id = id,
        examId = examId,
        examName = exam?.name ?: examName,
        className = paper?.className.orEmpty(),
        subjectId = paper?.subject?.id,
        subjectName = paper?.subject?.name.orEmpty(),
        sectionId = sectionId,
        sectionName = sectionName.orEmpty(),
        maxMarks = paper?.maxMarks ?: 0.0,
        passMarks = paper?.passMarks,
        paperDate = paper?.date,
        status = enumOrDefault(status, MarkSheetStatus.NOT_ENTERED),
        teacher = teacher?.toRef(),
        entered = if (rows != null) rowModels.count { !it.isPending } else entered,
        total = if (rows != null) rowModels.size else total,
        comment = comment,
        rows = rowModels,
    )
}

private fun MarkRowDto.toModel() = MarkRow(
    studentId = studentId,
    name = name,
    rollNo = rollNo,
    marks = if (absent) null else marks,
    absent = absent,
    remark = remark?.takeIf { it.isNotBlank() },
)

internal fun MarkEntry.toDto() = MarkInputDto(
    studentId = studentId,
    marks = if (absent) null else marks,
    absent = absent,
    remark = remark?.trim()?.takeIf { it.isNotEmpty() },
)

internal fun MarkInputDto.toEntry() = MarkEntry(studentId, marks, absent, remark)

/** Applies queued [entries] over the server rows so the screen shows what this device will send. */
internal fun MarkSheet.withEntries(entries: List<MarkEntry>): MarkSheet {
    val byStudent = entries.associateBy { it.studentId }
    val merged = rows.map { row ->
        byStudent[row.studentId]?.let { row.copy(marks = if (it.absent) null else it.marks, absent = it.absent, remark = it.remark) } ?: row
    }
    return copy(rows = merged, entered = merged.count { !it.isPending })
}

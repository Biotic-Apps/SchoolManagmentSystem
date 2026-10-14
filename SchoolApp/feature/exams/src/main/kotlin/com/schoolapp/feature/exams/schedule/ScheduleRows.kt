package com.schoolapp.feature.exams.schedule

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.exams.admin.ExamConflict
import com.schoolapp.core.model.exams.admin.ExamPaper
import com.schoolapp.core.model.exams.admin.SchedulePaperInput
import java.util.UUID

/** One editable date-sheet paper; marks are kept as typed text until saved. */
@Immutable
data class ScheduleRow(
    val key: String,
    val classId: String,
    val subjectId: String = "",
    val date: String = "",
    val startTime: String = DEFAULT_START,
    val endTime: String = DEFAULT_END,
    val maxMarks: String = DEFAULT_MAX,
    val passMarks: String = DEFAULT_PASS,
    val roomId: String? = null,
)

/** Client checks of one row (web schedule-rows.ts). */
enum class RowProblem { SUBJECT_MISSING, SUBJECT_TWICE, DATE_MISSING, END_BEFORE_START, MAX_INVALID, PASS_INVALID, PASS_ABOVE_MAX }

internal object ScheduleRows {
    fun fromPapers(papers: List<ExamPaper>): List<ScheduleRow> = papers.map { paper ->
        ScheduleRow(
            key = paper.id ?: newKey(),
            classId = paper.classId,
            subjectId = paper.subjectId,
            date = paper.date,
            startTime = paper.startTime,
            endTime = paper.endTime,
            maxMarks = paper.maxMarks.toString(),
            passMarks = paper.passMarks.toString(),
            roomId = paper.roomId,
        )
    }

    /** New paper for [classId], copying date, times and marks of the class's last paper. */
    fun newRow(classId: String, previous: ScheduleRow?): ScheduleRow = ScheduleRow(
        key = newKey(),
        classId = classId,
        date = previous?.date.orEmpty(),
        startTime = previous?.startTime ?: DEFAULT_START,
        endTime = previous?.endTime ?: DEFAULT_END,
        maxMarks = previous?.maxMarks ?: DEFAULT_MAX,
        passMarks = previous?.passMarks ?: DEFAULT_PASS,
    )

    fun signature(rows: List<ScheduleRow>): List<List<String?>> =
        rows.map { listOf(it.classId, it.subjectId, it.date, it.startTime, it.endTime, it.maxMarks, it.passMarks, it.roomId) }

    fun problems(row: ScheduleRow, rows: List<ScheduleRow>): List<RowProblem> = buildList {
        if (row.subjectId.isBlank()) {
            add(RowProblem.SUBJECT_MISSING)
        } else if (rows.any { it.key != row.key && it.classId == row.classId && it.subjectId == row.subjectId }) {
            add(RowProblem.SUBJECT_TWICE)
        }
        if (row.date.isBlank()) add(RowProblem.DATE_MISSING)
        if (row.startTime.isNotBlank() && row.endTime.isNotBlank() && row.startTime >= row.endTime) add(RowProblem.END_BEFORE_START)
        val max = row.maxMarks.toWholeOrNull()
        val pass = row.passMarks.toWholeOrNull()
        if (max == null || max <= 0 || max > MAX_LIMIT) add(RowProblem.MAX_INVALID)
        when {
            pass == null || pass > MAX_LIMIT -> add(RowProblem.PASS_INVALID)
            max != null && pass > max -> add(RowProblem.PASS_ABOVE_MAX)
        }
    }

    fun toInputs(rows: List<ScheduleRow>): List<SchedulePaperInput> = rows.map { row ->
        SchedulePaperInput(
            classId = row.classId,
            subjectId = row.subjectId,
            date = row.date,
            startTime = row.startTime,
            endTime = row.endTime,
            maxMarks = row.maxMarks.toInt(),
            passMarks = row.passMarks.toInt(),
            roomId = row.roomId,
        )
    }

    /** Row keys a 409 clash refers to: same class and subject, else same class or subject on that date. */
    fun rowsForClash(clash: ExamConflict, rows: List<ScheduleRow>): List<String> {
        val clashDate = clash.date?.take(DATE_LENGTH)
        val sameDate = { row: ScheduleRow -> clashDate == null || row.date == clashDate }
        return when {
            clash.classId != null && clash.subjectId != null -> rows.filter { it.classId == clash.classId && it.subjectId == clash.subjectId }
            clash.classId != null -> rows.filter { it.classId == clash.classId && sameDate(it) }
            clash.subjectId != null -> rows.filter { it.subjectId == clash.subjectId && sameDate(it) }
            else -> emptyList()
        }.map { it.key }
    }

    private fun String.toWholeOrNull(): Int? = trim().takeIf { it.isNotEmpty() && it.all(Char::isDigit) }?.toIntOrNull()

    private fun newKey() = "row-${UUID.randomUUID()}"

    private const val MAX_LIMIT = 1000
    private const val DATE_LENGTH = 10
}

private const val DEFAULT_START = "09:00"
private const val DEFAULT_END = "11:00"
private const val DEFAULT_MAX = "100"
private const val DEFAULT_PASS = "33"

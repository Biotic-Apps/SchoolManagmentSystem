package com.schoolapp.feature.exams

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.model.exams.ChildResults
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkRow
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.core.model.exams.ReportCard
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.model.progress.ProgressNoteInput
import com.schoolapp.core.model.progress.ProgressNoteOutcome
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

internal fun row(id: String, roll: Int, marks: Double? = null, absent: Boolean = false) =
    MarkRow(studentId = id, name = "Student $roll", rollNo = roll, marks = marks, absent = absent, remark = null)

internal fun sheet(status: MarkSheetStatus = MarkSheetStatus.DRAFT, rows: List<MarkRow>, comment: String? = null) = MarkSheet(
    id = "ms1", examId = "ex1", examName = "Final exam", className = "Class 5", subjectId = "sub1", subjectName = "Mathematics",
    sectionId = "sec1", sectionName = "A", maxMarks = 100.0, passMarks = 33.0, paperDate = "2026-10-01", status = status,
    teacher = null, entered = rows.count { !it.isPending }, total = rows.size, comment = comment, rows = rows,
)

internal fun result(studentId: String, examId: String, percent: Double) = StudentResult(
    studentId = studentId, name = "Child", rollNo = 1, examId = examId, examName = "Exam $examId", publishedAt = "2026-09-01",
    subjects = emptyList(), totalMarks = percent, maxTotal = 100.0, percent = percent, grade = "A", position = null,
    passed = true, remarks = null, teacherRemark = null,
)

internal class FakeExamsRepository(var loaded: LoadedMarkSheet) : ExamsRepository {
    val saveCalls = mutableListOf<Pair<List<MarkEntry>, String>>()
    val submitCalls = mutableListOf<Pair<List<MarkEntry>, String>>()
    val outcomes = ArrayDeque<AppResult<MarkSheetOutcome>>()
    val sync = MutableStateFlow(MarkSheetSyncState.NONE)
    var discardCalls = 0
    var childResults: Map<String, ChildResults> = emptyMap()
    var reportCard: ReportCard = ReportCard(ReportCardStatus.PENDING, null, null)
    var examList: List<Exam> = emptyList()
    var sheetsByExam: Map<String, List<MarkSheet>> = emptyMap()
    var resultsBySection: Map<String, List<StudentResult>> = emptyMap()
    var resultsFailure: AppError? = null
    val resultCalls = mutableListOf<Pair<String, String?>>()

    private fun next(entries: List<MarkEntry>, status: MarkSheetStatus): AppResult<MarkSheetOutcome> = outcomes.removeFirstOrNull()
        ?: run {
            val byId = entries.associateBy { it.studentId }
            val rows = loaded.sheet.rows.map { r -> byId[r.studentId]?.let { r.copy(marks = it.marks, absent = it.absent) } ?: r }
            AppResult.Success(MarkSheetOutcome.Saved(loaded.sheet.copy(rows = rows, status = status)))
        }

    override suspend fun exams(status: ExamStatus?, branchId: String?): AppResult<List<Exam>> =
        AppResult.Success(examList.filter { status == null || it.status == status })
    override suspend fun markSheets(examId: String): AppResult<List<MarkSheet>> = AppResult.Success(sheetsByExam[examId].orEmpty())
    override suspend fun myMarkSheets(): AppResult<List<MarkSheet>> = AppResult.Success(emptyList())
    override suspend fun markSheet(id: String): AppResult<LoadedMarkSheet> = AppResult.Success(loaded)

    override suspend fun saveMarks(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome> {
        saveCalls += entries to clientRequestId
        return next(entries, MarkSheetStatus.DRAFT)
    }

    override suspend fun submit(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome> {
        submitCalls += entries to clientRequestId
        return next(entries, MarkSheetStatus.SUBMITTED)
    }

    override fun syncState(sheetId: String): Flow<MarkSheetSyncState> = sync

    override suspend fun discardLocal(sheetId: String) {
        discardCalls++
    }

    override suspend fun accept(id: String, comment: String?): AppResult<MarkSheet> =
        AppResult.Success(loaded.sheet.copy(status = MarkSheetStatus.ACCEPTED, comment = comment))

    override suspend fun returnSheet(id: String, comment: String): AppResult<MarkSheet> =
        AppResult.Success(loaded.sheet.copy(status = MarkSheetStatus.RETURNED, comment = comment))

    override suspend fun childResults(studentId: String): AppResult<ChildResults> =
        childResults[studentId]?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))

    override suspend fun sectionResults(examId: String, sectionId: String?): AppResult<List<StudentResult>> {
        resultCalls += examId to sectionId
        resultsFailure?.let { return AppResult.Failure(it) }
        return AppResult.Success(resultsBySection[sectionId].orEmpty())
    }

    override suspend fun reportCard(studentId: String, examId: String): AppResult<ReportCard> = AppResult.Success(reportCard)
}

internal class FakeProgressRepository(private val notes: Map<String, List<ProgressNote>> = emptyMap()) : ProgressRepository {
    override suspend fun notes(studentId: String): AppResult<List<ProgressNote>> = AppResult.Success(notes[studentId].orEmpty())
    override suspend fun addNote(studentId: String, input: ProgressNoteInput): AppResult<ProgressNoteOutcome> = error("unused")
    override suspend fun saveHomeworkStatus(diaryId: String, ticks: List<HomeworkTick>): AppResult<Unit> = error("unused")
    override suspend fun homeworkCompletion(studentId: String, from: String?, to: String?): AppResult<List<HomeworkCompletionItem>> =
        error("unused")
}

package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.DefaultExamsRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.exams.ChildResults
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.core.model.exams.ReportCard
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.model.exams.TrendPoint
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareExamsRepository @Inject constructor(
    private val real: DefaultExamsRepository,
    private val auth: DemoAwareAuthRepository,
) : ExamsRepository {

    override suspend fun exams(status: ExamStatus?, branchId: String?): AppResult<List<Exam>> {
        if (!auth.isDemoActive) return real.exams(status, branchId)
        return AppResult.Success(DemoExamsData.exams.filter { status == null || it.status == status })
    }

    override suspend fun markSheets(examId: String): AppResult<List<MarkSheet>> {
        if (!auth.isDemoActive) return real.markSheets(examId)
        return AppResult.Success(visibleSheets().filter { it.examId == examId })
    }

    override suspend fun myMarkSheets(): AppResult<List<MarkSheet>> {
        if (!auth.isDemoActive) return real.myMarkSheets()
        val open = DemoExamsData.exams.filter { it.status == ExamStatus.MARKS_OPEN }.map { it.id }.toSet()
        return AppResult.Success(visibleSheets().filter { it.examId in open })
    }

    override suspend fun markSheet(id: String): AppResult<LoadedMarkSheet> {
        if (!auth.isDemoActive) return real.markSheet(id)
        return find(id)?.let { AppResult.Success(LoadedMarkSheet(it, localEntries = null)) } ?: notFound()
    }

    override suspend fun saveMarks(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome> {
        if (!auth.isDemoActive) return real.saveMarks(sheetId, entries, clientRequestId)
        val sheet = find(sheetId) ?: return notFound()
        if (!sheet.status.isEditable) return AppResult.Failure(AppError.Server(CONFLICT, "SHEET_LOCKED", "This mark sheet can no longer be changed."))
        if (entries.any { (it.marks ?: 0.0) > sheet.maxMarks || (it.marks ?: 0.0) < 0.0 }) {
            return AppResult.Failure(AppError.Validation("Marks must be between 0 and ${sheet.maxMarks.toInt()}."))
        }
        return AppResult.Success(MarkSheetOutcome.Saved(update(sheetId) { it.withEntries(entries).copy(status = MarkSheetStatus.DRAFT) }))
    }

    override suspend fun submit(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome> {
        if (!auth.isDemoActive) return real.submit(sheetId, entries, clientRequestId)
        when (val saved = saveMarks(sheetId, entries, clientRequestId)) {
            is AppResult.Failure -> return saved
            is AppResult.Success -> Unit
        }
        val pending = find(sheetId)?.rows.orEmpty().count { it.isPending }
        if (pending > 0) return AppResult.Failure(AppError.Validation("$pending students are still pending."))
        return AppResult.Success(MarkSheetOutcome.Saved(update(sheetId) { it.copy(status = MarkSheetStatus.SUBMITTED, comment = null) }))
    }

    override fun syncState(sheetId: String): Flow<MarkSheetSyncState> =
        if (auth.isDemoActive) flowOf(MarkSheetSyncState.NONE) else real.syncState(sheetId)

    override suspend fun discardLocal(sheetId: String) {
        if (!auth.isDemoActive) real.discardLocal(sheetId)
    }

    override suspend fun accept(id: String, comment: String?): AppResult<MarkSheet> {
        if (!auth.isDemoActive) return real.accept(id, comment)
        return decide(id, MarkSheetStatus.ACCEPTED, comment)
    }

    override suspend fun returnSheet(id: String, comment: String): AppResult<MarkSheet> {
        if (!auth.isDemoActive) return real.returnSheet(id, comment)
        return decide(id, MarkSheetStatus.RETURNED, comment)
    }

    override suspend fun childResults(studentId: String): AppResult<ChildResults> {
        if (!auth.isDemoActive) return real.childResults(studentId)
        val results = DemoExamsData.results(studentId)
        return AppResult.Success(ChildResults(results, results.reversed().map { TrendPoint(it.examId, it.examName, it.percent) }))
    }

    /** No report card files exist in the demo, so they always read as being prepared. */
    override suspend fun reportCard(studentId: String, examId: String): AppResult<ReportCard> {
        if (!auth.isDemoActive) return real.reportCard(studentId, examId)
        return AppResult.Success(ReportCard(ReportCardStatus.PENDING, fileUrl = null, generatedAt = null))
    }

    private fun decide(id: String, status: MarkSheetStatus, comment: String?): AppResult<MarkSheet> {
        val sheet = find(id) ?: return notFound()
        if (sheet.status != MarkSheetStatus.SUBMITTED) {
            return AppResult.Failure(AppError.Server(CONFLICT, "INVALID_STATE", "Only submitted mark sheets can be reviewed."))
        }
        return AppResult.Success(update(id) { it.copy(status = status, comment = comment?.trim()?.takeIf(String::isNotEmpty)) })
    }

    /** Teachers and helpers see their own sections; supervisors see every sheet. */
    private fun visibleSheets(): List<MarkSheet> {
        val all = DemoExamsData.sheets.value
        return when (auth.demoSession.value?.activeRole) {
            RoleKey.TEACHER, RoleKey.HELPER -> all.filter { it.sectionId in DemoAwareStudentsRepository.TEACHER_SECTIONS }
            else -> all
        }
    }

    private fun find(id: String): MarkSheet? = DemoExamsData.sheets.value.firstOrNull { it.id == id }

    private fun update(id: String, transform: (MarkSheet) -> MarkSheet): MarkSheet {
        DemoExamsData.sheets.update { list -> list.map { if (it.id == id) transform(it) else it } }
        return checkNotNull(find(id))
    }

    private fun MarkSheet.withEntries(entries: List<MarkEntry>): MarkSheet {
        val byStudent = entries.associateBy { it.studentId }
        val merged = rows.map { row ->
            byStudent[row.studentId]?.let { row.copy(marks = if (it.absent) null else it.marks, absent = it.absent, remark = it.remark) } ?: row
        }
        return copy(rows = merged, entered = merged.count { !it.isPending })
    }

    private fun <T> notFound(): AppResult<T> = AppResult.Failure(AppError.Server(NOT_FOUND, "NOT_FOUND", null))

    private companion object {
        const val NOT_FOUND = 404
        const val CONFLICT = 409
    }
}

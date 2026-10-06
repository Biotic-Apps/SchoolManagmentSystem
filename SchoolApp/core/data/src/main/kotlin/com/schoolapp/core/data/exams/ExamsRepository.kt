package com.schoolapp.core.data.exams

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.exams.ChildResults
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.core.model.exams.ReportCard
import kotlinx.coroutines.flow.Flow

interface ExamsRepository {
    suspend fun exams(status: ExamStatus? = null, branchId: String? = null): AppResult<List<Exam>>

    /** Sheets of one exam; the server scopes them (teachers: own subject-sections). */
    suspend fun markSheets(examId: String): AppResult<List<MarkSheet>>

    /** Sheets of every exam open for marks, for the signed-in teacher. */
    suspend fun myMarkSheets(): AppResult<List<MarkSheet>>

    /** Server copy plus marks still queued on this device; offline falls back to the last copy opened. */
    suspend fun markSheet(id: String): AppResult<LoadedMarkSheet>

    /** `PUT /mark-sheets/:id` (DRAFT); offline it is queued and [MarkSheetOutcome.Queued] returned. */
    suspend fun saveMarks(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome>

    /** Saves [entries] then submits; offline both calls are queued in order. */
    suspend fun submit(sheetId: String, entries: List<MarkEntry>, clientRequestId: String): AppResult<MarkSheetOutcome>

    fun syncState(sheetId: String): Flow<MarkSheetSyncState>

    /** Drops this device's queued marks of the sheet. */
    suspend fun discardLocal(sheetId: String)

    suspend fun accept(id: String, comment: String?): AppResult<MarkSheet>

    suspend fun returnSheet(id: String, comment: String): AppResult<MarkSheet>

    suspend fun childResults(studentId: String): AppResult<ChildResults>

    suspend fun reportCard(studentId: String, examId: String): AppResult<ReportCard>
}

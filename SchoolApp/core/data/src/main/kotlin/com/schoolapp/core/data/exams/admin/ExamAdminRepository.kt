package com.schoolapp.core.data.exams.admin

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.admin.ExamConflict
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.admin.ExamInput
import com.schoolapp.core.model.exams.admin.ExamPrintInput
import com.schoolapp.core.model.exams.admin.SchedulePaperInput

/** Exam setup and the results workflow. All calls run on the IO dispatcher. */
interface ExamAdminRepository {
    suspend fun exam(id: String): AppResult<ExamDetail>

    suspend fun create(input: ExamInput): AppResult<ExamDetail>

    suspend fun update(id: String, input: ExamInput): AppResult<ExamDetail>

    /** Replaces the date sheet; a 409 clash comes back as a Server error (read it with [conflicts]). */
    suspend fun saveSchedule(id: String, papers: List<SchedulePaperInput>): AppResult<ExamDetail>

    /** [status] must be MARKS_OPEN or MARKS_CLOSED. */
    suspend fun setStatus(id: String, status: ExamStatus): AppResult<ExamDetail>

    /** Starts computing results and waits for the job (up to about a minute). Success = finished. */
    suspend fun computeAndWait(id: String): AppResult<Unit>

    /** Sends results for the principal's approval; 409 lists unaccepted sheets ([conflicts]). */
    suspend fun approveResults(id: String): AppResult<ExamDetail>

    suspend fun publish(id: String): AppResult<ExamDetail>

    /** Queues an exam PDF and waits for its signed file url. */
    suspend fun print(examId: String, input: ExamPrintInput): AppResult<String>

    /** Subjects taught in [classId], by name. */
    suspend fun classSubjects(classId: String): AppResult<List<PersonRef>>

    /** Terms of an academic session, in order. */
    suspend fun terms(sessionId: String): AppResult<List<PersonRef>>

    /** Rows of a 409 error's details (unaccepted sheets, schedule clashes); empty when there are none. */
    fun conflicts(error: AppError): List<ExamConflict>
}

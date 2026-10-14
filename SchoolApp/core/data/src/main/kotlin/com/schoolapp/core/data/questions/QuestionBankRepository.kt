package com.schoolapp.core.data.questions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.core.model.questions.GeneratePaperInput
import com.schoolapp.core.model.questions.PaperStatus
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.model.questions.QuestionFilter
import com.schoolapp.core.model.questions.QuestionInput

/** Question bank (`/questions`) and generated exam papers (`/exam-papers`). */
interface QuestionBankRepository {
    /** One page (newest first) of active questions; a full page means more may follow. */
    suspend fun questions(filter: QuestionFilter, page: Int = 1): AppResult<List<Question>>
    suspend fun question(id: String): AppResult<Question>
    suspend fun createQuestion(input: QuestionInput): AppResult<Question>

    /** Subject, class and school of [input] are ignored: the API keeps the original ones. */
    suspend fun updateQuestion(id: String, input: QuestionInput): AppResult<Question>

    /** Archives the question (DELETE). */
    suspend fun archiveQuestion(id: String): AppResult<Unit>

    suspend fun papers(schoolId: String?, subjectId: String?, classId: String?): AppResult<List<ExamPaper>>
    suspend fun paper(id: String): AppResult<ExamPaper>

    /** 400 VALIDATION_FAILED when the bank has too few matching questions for a section. */
    suspend fun generatePaper(input: GeneratePaperInput): AppResult<ExamPaper>
    suspend fun setPaperStatus(id: String, status: PaperStatus): AppResult<ExamPaper>

    /** Downloads the printable PDF into the app cache; returns a `content://` uri for a viewer. */
    suspend fun downloadPaperPdf(paper: ExamPaper): AppResult<String>

    companion object {
        /** Rows per [questions] page (the API maximum). */
        const val PAGE_SIZE = 100
    }
}

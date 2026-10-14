package com.schoolapp.core.data.questions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.pdf.PdfFileStore
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.core.model.questions.GeneratePaperInput
import com.schoolapp.core.model.questions.PaperStatus
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.model.questions.QuestionFilter
import com.schoolapp.core.model.questions.QuestionInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.questions.QuestionsApi
import com.schoolapp.core.network.dto.questions.UpdateExamPaperRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultQuestionBankRepository @Inject constructor(
    private val api: QuestionsApi,
    private val apiCaller: ApiCaller,
    private val pdfFiles: PdfFileStore,
) : QuestionBankRepository {

    override suspend fun questions(filter: QuestionFilter, page: Int): AppResult<List<Question>> = apiCaller.call {
        api.questions(
            schoolId = filter.schoolId,
            subjectId = filter.subjectId,
            classId = filter.classId,
            questionType = filter.type?.key,
            difficultyLevel = filter.difficulty?.key,
            search = filter.search?.trim()?.takeIf { it.isNotEmpty() },
            page = page,
        ).data.map { it.toModel() }
    }

    override suspend fun question(id: String): AppResult<Question> = apiCaller.call { api.question(id).data.toModel() }

    override suspend fun createQuestion(input: QuestionInput): AppResult<Question> =
        apiCaller.call { api.createQuestion(input.toCreateRequest()).data.toModel() }

    override suspend fun updateQuestion(id: String, input: QuestionInput): AppResult<Question> =
        apiCaller.call { api.updateQuestion(id, input.toUpdateRequest()).data.toModel() }

    override suspend fun archiveQuestion(id: String): AppResult<Unit> = apiCaller.call {
        api.archiveQuestion(id)
        Unit
    }

    override suspend fun papers(schoolId: String?, subjectId: String?, classId: String?): AppResult<List<ExamPaper>> =
        apiCaller.call { api.papers(schoolId, subjectId, classId).data.map { it.toModel() } }

    override suspend fun paper(id: String): AppResult<ExamPaper> = apiCaller.call { api.paper(id).data.toModel() }

    override suspend fun generatePaper(input: GeneratePaperInput): AppResult<ExamPaper> =
        apiCaller.call { api.generatePaper(input.toRequest()).data.toModel() }

    override suspend fun setPaperStatus(id: String, status: PaperStatus): AppResult<ExamPaper> =
        apiCaller.call { api.updatePaper(id, UpdateExamPaperRequest(status = status.key)).data.toModel() }

    override suspend fun downloadPaperPdf(paper: ExamPaper): AppResult<String> =
        pdfFiles.get(QuestionsApi.paperPdfPath(paper.id), "exam-paper-${paper.title.take(TITLE_IN_NAME)}")

    private companion object {
        const val TITLE_IN_NAME = 40
    }
}

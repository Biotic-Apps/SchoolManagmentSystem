package com.schoolapp.core.data.exams

import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.ExamsApi
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.exams.ExamDto
import com.schoolapp.core.network.dto.exams.ExamTermDto
import com.schoolapp.core.network.dto.exams.MarkRowDto
import com.schoolapp.core.network.dto.exams.MarkSheetBodyDto
import com.schoolapp.core.network.dto.exams.MarkSheetDto
import com.schoolapp.core.network.dto.exams.PaperDto
import com.schoolapp.core.network.dto.exams.ReportCardDto
import com.schoolapp.core.network.dto.exams.StudentResultDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject

internal class FakeExamsApi : ExamsApi {
    var fail: Exception? = null
    var termsFail: Exception? = null
    var saveCalls = 0
    var lastSubmitKey: String? = null
    var submitResponse: JsonObject = NetworkJson.encodeToJsonElement(MarkSheetDto.serializer(), sheet("SUBMITTED")).jsonObject
    var examsResponse: List<ExamDto> = emptyList()
    var termsBySession: Map<String, List<ExamTermDto>> = emptyMap()
    val termCalls = mutableListOf<String>()
    var resultsResponse: List<StudentResultDto> = emptyList()
    var lastResultsQuery: Pair<String, String?>? = null

    private fun check() = fail?.let { throw it }

    override suspend fun exams(branchId: String?, sessionId: String?, status: String?): ApiEnvelope<List<ExamDto>> {
        check()
        return ApiEnvelope(examsResponse)
    }

    override suspend fun markSheets(examId: String, sectionId: String?, subjectId: String?): ApiEnvelope<List<MarkSheetDto>> {
        check()
        return ApiEnvelope(listOf(sheet("DRAFT")))
    }

    override suspend fun markSheet(id: String): ApiEnvelope<MarkSheetDto> {
        check()
        return ApiEnvelope(sheet("DRAFT"))
    }

    override suspend fun saveMarks(id: String, body: MarkSheetBodyDto, idempotencyKey: String): ApiEnvelope<MarkSheetDto> {
        check()
        saveCalls++
        return ApiEnvelope(sheet("DRAFT"))
    }

    override suspend fun submit(id: String, idempotencyKey: String): ApiEnvelope<JsonObject> {
        check()
        lastSubmitKey = idempotencyKey
        return ApiEnvelope(submitResponse)
    }

    override suspend fun accept(id: String, body: CommentBodyDto): ApiEnvelope<MarkSheetDto> = ApiEnvelope(sheet("ACCEPTED"))

    override suspend fun returnSheet(id: String, body: CommentBodyDto): ApiEnvelope<MarkSheetDto> = ApiEnvelope(sheet("RETURNED"))

    override suspend fun studentResults(studentId: String): ApiEnvelope<JsonElement> = error("unused")

    override suspend fun results(examId: String, sectionId: String?): ApiEnvelope<List<StudentResultDto>> {
        check()
        lastResultsQuery = examId to sectionId
        return ApiEnvelope(resultsResponse)
    }

    override suspend fun sessionTerms(sessionId: String): ApiEnvelope<List<ExamTermDto>> {
        termCalls += sessionId
        termsFail?.let { throw it }
        return ApiEnvelope(termsBySession[sessionId].orEmpty())
    }

    override suspend fun reportCard(studentId: String, examId: String): ApiEnvelope<ReportCardDto> = error("unused")

    companion object {
        fun sheet(status: String) = MarkSheetDto(
            id = "ms1",
            examId = "ex1",
            paper = PaperDto(className = "Class 5", maxMarks = 100.0, passMarks = 33.0),
            sectionId = "sec",
            sectionName = "A",
            status = status,
            rows = listOf(
                MarkRowDto("s1", "A", 1, 10.0, false),
                MarkRowDto("s2", "B", 2, null, false),
                MarkRowDto("s3", "C", 3, null, true),
            ),
        )
    }
}

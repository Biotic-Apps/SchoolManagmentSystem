package com.schoolapp.core.data.exams.admin

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.admin.ExamConflict
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.admin.ExamInput
import com.schoolapp.core.model.exams.admin.ExamPrintInput
import com.schoolapp.core.model.exams.admin.SchedulePaperInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.exams.ExamAdminApi
import com.schoolapp.core.network.dto.exams.admin.ExamStatusBodyDto
import com.schoolapp.core.network.dto.exams.admin.ScheduleBodyDto
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultExamAdminRepository @Inject constructor(
    private val api: ExamAdminApi,
    private val apiCaller: ApiCaller,
    private val jobs: JobFileWaiter,
    private val json: Json,
) : ExamAdminRepository {

    override suspend fun exam(id: String): AppResult<ExamDetail> = apiCaller.call { api.exam(id).data.toModel() }

    override suspend fun create(input: ExamInput): AppResult<ExamDetail> =
        apiCaller.call { api.create(input.toCreateBody()).data.toModel() }

    override suspend fun update(id: String, input: ExamInput): AppResult<ExamDetail> =
        apiCaller.call { api.update(id, input.toUpdateBody()).data.toModel() }

    override suspend fun saveSchedule(id: String, papers: List<SchedulePaperInput>): AppResult<ExamDetail> =
        apiCaller.call { api.saveSchedule(id, ScheduleBodyDto(papers.map { it.toBody() })).data.toModel() }

    override suspend fun setStatus(id: String, status: ExamStatus): AppResult<ExamDetail> =
        apiCaller.call { api.setStatus(id, ExamStatusBodyDto(status.name)).data.toModel() }

    override suspend fun computeAndWait(id: String): AppResult<Unit> {
        val jobId = when (val started = apiCaller.call { api.compute(id).data.jobId }) {
            is AppResult.Failure -> return started
            is AppResult.Success -> started.data
        }
        return if (jobId.isNullOrBlank()) AppResult.Success(Unit) else jobs.awaitDone(jobId)
    }

    override suspend fun approveResults(id: String): AppResult<ExamDetail> =
        apiCaller.call { api.approveResults(id).data.toModel() }

    override suspend fun publish(id: String): AppResult<ExamDetail> = apiCaller.call { api.publish(id).data.toModel() }

    override suspend fun print(examId: String, input: ExamPrintInput): AppResult<String> {
        val jobId = when (val started = apiCaller.call { api.print(examId, input.toBody()).data.jobId }) {
            is AppResult.Failure -> return started
            is AppResult.Success -> started.data
        }
        return if (jobId.isNullOrBlank()) AppResult.Failure(AppError.Unknown()) else jobs.awaitFile(jobId)
    }

    override suspend fun classSubjects(classId: String): AppResult<List<PersonRef>> =
        apiCaller.call { api.classSubjects(classId).data.mapNotNull { it.toRef()?.takeIf { ref -> ref.id != null } }.sortedBy { it.name.lowercase() } }

    override suspend fun terms(sessionId: String): AppResult<List<PersonRef>> =
        apiCaller.call { api.sessionTerms(sessionId).data.mapNotNull { it.toRef()?.takeIf { ref -> ref.id != null } } }

    override fun conflicts(error: AppError): List<ExamConflict> {
        val details = (error as? AppError.Server)?.takeIf { it.httpCode == HTTP_CONFLICT }?.details ?: return emptyList()
        return runCatching { json.parseToJsonElement(details).toConflicts() }.getOrDefault(emptyList())
    }

    private companion object {
        const val HTTP_CONFLICT = 409
    }
}

package com.schoolapp.core.data.idcards

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.pdf.BackgroundJobs
import com.schoolapp.core.model.idcards.IdCardPrintTarget
import com.schoolapp.core.model.idcards.IdCardSheets
import com.schoolapp.core.model.idcards.StudentIdCard
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.idcards.StudentIdCardApi
import com.schoolapp.core.network.dto.idcards.IdCardPrintBodyDto
import com.schoolapp.core.network.dto.idcards.StudentIdCardDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStudentIdCardRepository @Inject constructor(
    private val api: StudentIdCardApi,
    private val jobs: BackgroundJobs,
    private val apiCaller: ApiCaller,
) : StudentIdCardRepository {

    override suspend fun card(studentId: String): AppResult<StudentIdCard?> =
        when (val result = apiCaller.call { api.status(studentId).data.toModel() }) {
            is AppResult.Success -> result
            is AppResult.Failure -> if (result.error.isNotFound()) AppResult.Success(null) else result
        }

    override suspend fun generate(studentId: String): AppResult<Unit> = apiCaller.call { api.generate(studentId); Unit }

    override suspend fun printSheets(target: IdCardPrintTarget): AppResult<IdCardSheets> {
        val body = when (target) {
            is IdCardPrintTarget.Section -> IdCardPrintBodyDto(sectionId = target.sectionId)
            is IdCardPrintTarget.Branch -> IdCardPrintBodyDto(branchId = target.branchId, classId = target.classId)
        }
        val job = when (val queued = apiCaller.call { api.print(body).data }) {
            is AppResult.Failure -> return queued
            is AppResult.Success -> queued.data
        }
        return when (val done = jobs.await(job.jobId)) {
            is AppResult.Failure -> done
            is AppResult.Success -> done.data.fileUrl
                ?.let { AppResult.Success(IdCardSheets(it, done.data.count ?: job.count)) }
                ?: AppResult.Failure(AppError.Server(HTTP_SERVER_ERROR, BackgroundJobs.CODE_FAILED, null))
        }
    }

    private fun AppError.isNotFound(): Boolean = this is AppError.Server && (httpCode == NOT_FOUND || code == "NOT_FOUND")

    private fun StudentIdCardDto.toModel() = StudentIdCard(
        status = IdCardStatus.entries.firstOrNull { it.name == status } ?: IdCardStatus.UNKNOWN,
        fileUrl = fileUrl?.takeIf { it.isNotBlank() },
        version = version,
        generatedAt = generatedAt,
    )

    private companion object {
        const val NOT_FOUND = 404
        const val HTTP_SERVER_ERROR = 500
    }
}

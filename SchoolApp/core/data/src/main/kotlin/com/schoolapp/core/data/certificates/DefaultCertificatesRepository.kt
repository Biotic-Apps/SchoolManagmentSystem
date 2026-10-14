package com.schoolapp.core.data.certificates

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.exams.admin.JobFileWaiter
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.CertificatesApi
import com.schoolapp.core.network.dto.certificates.CertificateBodyDto
import com.schoolapp.core.network.dto.certificates.CertificateDetailsBodyDto
import com.schoolapp.core.network.dto.certificates.IssueCertificateBodyDto
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.model.ApiErrorCodes
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultCertificatesRepository @Inject constructor(
    private val api: CertificatesApi,
    private val apiCaller: ApiCaller,
    private val json: Json,
    private val jobs: JobFileWaiter,
) : CertificatesRepository {

    override suspend fun certificates(studentId: String?, status: CertificateStatus?, branchId: String?): AppResult<List<Certificate>> =
        apiCaller.call { api.certificates(studentId, status?.name, branchId).data.map { it.toModel() }.sortedByDescending { it.createdAt.orEmpty() } }

    override suspend fun request(input: CertificateInput): AppResult<Certificate> =
        apiCaller.call {
            val details = input.achievement.clean()?.let { CertificateDetailsBodyDto(achievement = it) }
            api.request(CertificateBodyDto(input.studentId, input.type.name, input.purpose.clean(), details)).data.toModel()
        }

    override suspend fun approve(id: String): AppResult<CertificateDecision> =
        decision(apiCaller.call { api.approve(id, CommentBodyDto()).data.toModel() })

    override suspend fun reject(id: String, reason: String): AppResult<Certificate> =
        apiCaller.call { api.reject(id, ReasonBodyDto(reason.trim())).data.toModel() }

    override suspend fun certificate(id: String): AppResult<Certificate> = apiCaller.call { api.certificate(id).data.toModel() }

    override suspend fun issue(id: String, effectiveDate: String?): AppResult<CertificateDecision> =
        decision(apiCaller.call { api.issue(id, IssueCertificateBodyDto(effectiveDate)).data.toModel() })

    override suspend fun reissue(id: String, reason: String): AppResult<Certificate> =
        apiCaller.call { api.reissue(id, ReasonBodyDto(reason.trim())).data.toModel() }

    override suspend fun pdfUrl(jobId: String): AppResult<String> = jobs.awaitFile(jobId)

    /** `409 CLEARANCE_REQUIRED` becomes [CertificateDecision.Blocked]; other failures pass through. */
    private fun decision(result: AppResult<Certificate>): AppResult<CertificateDecision> = when (result) {
        is AppResult.Success -> AppResult.Success(CertificateDecision.Done(result.data))
        is AppResult.Failure -> {
            val error = result.error
            if (error is AppError.Server && error.code == ApiErrorCodes.CLEARANCE_REQUIRED) {
                AppResult.Success(CertificateDecision.Blocked(clearanceFrom(error.details, json)))
            } else {
                result
            }
        }
    }
}

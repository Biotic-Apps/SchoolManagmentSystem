package com.schoolapp.core.data.certificates

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.CertificatesApi
import com.schoolapp.core.network.dto.certificates.CertificateBodyDto
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
) : CertificatesRepository {

    override suspend fun certificates(studentId: String?, status: CertificateStatus?, branchId: String?): AppResult<List<Certificate>> =
        apiCaller.call { api.certificates(studentId, status?.name, branchId).data.map { it.toModel() }.sortedByDescending { it.createdAt.orEmpty() } }

    override suspend fun request(input: CertificateInput): AppResult<Certificate> =
        apiCaller.call { api.request(CertificateBodyDto(input.studentId, input.type.name, input.purpose.clean())).data.toModel() }

    override suspend fun approve(id: String): AppResult<CertificateDecision> =
        when (val result = apiCaller.call { api.approve(id, CommentBodyDto()).data.toModel() }) {
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

    override suspend fun reject(id: String, reason: String): AppResult<Certificate> =
        apiCaller.call { api.reject(id, ReasonBodyDto(reason.trim())).data.toModel() }
}

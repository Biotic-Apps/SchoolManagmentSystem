package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.data.certificates.DefaultCertificatesRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateStatus
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareCertificatesRepository @Inject constructor(
    private val real: DefaultCertificatesRepository,
    private val auth: DemoAwareAuthRepository,
) : CertificatesRepository {

    override suspend fun certificates(studentId: String?, status: CertificateStatus?, branchId: String?): AppResult<List<Certificate>> {
        if (!auth.isDemoActive) return real.certificates(studentId, status, branchId)
        val session = auth.demoSession.value
        val childIds = session?.children?.map { it.id }.orEmpty().toSet()
        val parent = session?.activeRole == RoleKey.PARENT
        val list = DemoCertificatesData.certificates.value.filter { cert ->
            (studentId == null || cert.studentId == studentId) &&
                (status == null || cert.status == status) &&
                (!parent || cert.studentId in childIds)
        }
        return AppResult.Success(list.sortedByDescending { it.createdAt.orEmpty() })
    }

    override suspend fun request(input: CertificateInput): AppResult<Certificate> {
        if (!auth.isDemoActive) return real.request(input)
        val created = DemoCertificatesData.certificate(
            id = "demo-cert-${System.currentTimeMillis()}",
            type = input.type,
            status = CertificateStatus.REQUESTED,
            studentId = input.studentId,
            purpose = input.purpose?.trim()?.takeIf { it.isNotEmpty() },
            requestedAt = DemoDates.isoNow(),
        ).copy(requestedBy = DemoActors.forRole(auth.demoSession.value?.activeRole))
        DemoCertificatesData.certificates.update { listOf(created) + it }
        return AppResult.Success(created)
    }

    override suspend fun approve(id: String): AppResult<CertificateDecision> {
        if (!auth.isDemoActive) return real.approve(id)
        val current = DemoCertificatesData.certificates.value.firstOrNull { it.id == id } ?: return notFound()
        val block = DemoCertificatesData.clearanceByStudent[current.studentId]
        if (current.needsClearance && block != null) return AppResult.Success(CertificateDecision.Blocked(block))
        return update(id) { it.copy(status = CertificateStatus.APPROVED) }.let { result ->
            when (result) {
                is AppResult.Success -> AppResult.Success(CertificateDecision.Done(result.data))
                is AppResult.Failure -> result
            }
        }
    }

    override suspend fun reject(id: String, reason: String): AppResult<Certificate> {
        if (!auth.isDemoActive) return real.reject(id, reason)
        return update(id) { it.copy(status = CertificateStatus.REJECTED, reason = reason.trim()) }
    }

    private fun update(id: String, transform: (Certificate) -> Certificate): AppResult<Certificate> {
        DemoCertificatesData.certificates.update { list -> list.map { if (it.id == id) transform(it) else it } }
        return DemoCertificatesData.certificates.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) } ?: notFound()
    }

    private fun notFound(): AppResult.Failure = AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
}

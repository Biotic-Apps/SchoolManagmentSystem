package com.schoolapp.feature.certificates

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.certificates.ClearanceBlock

internal fun certificate(id: String, studentId: String, type: CertificateType, status: CertificateStatus = CertificateStatus.REQUESTED) =
    Certificate(
        id = id, type = type, status = status, serial = null, studentId = studentId, studentName = "Student $studentId",
        className = "Class 5", sectionName = "A", purpose = null, requestedBy = null, createdAt = "2026-10-01T05:00:00Z",
        issuedOn = null, fileUrl = null, reason = null,
    )

internal class FakeCertificatesRepository(var all: List<Certificate> = emptyList()) : CertificatesRepository {
    val queries = mutableListOf<Pair<String?, CertificateStatus?>>()
    val requests = mutableListOf<CertificateInput>()
    val rejects = mutableListOf<Pair<String, String>>()
    var blocks: Map<String, ClearanceBlock> = emptyMap()

    override suspend fun certificates(studentId: String?, status: CertificateStatus?, branchId: String?): AppResult<List<Certificate>> {
        queries += studentId to status
        return AppResult.Success(all.filter { (studentId == null || it.studentId == studentId) && (status == null || it.status == status) })
    }

    override suspend fun request(input: CertificateInput): AppResult<Certificate> {
        requests += input
        return AppResult.Success(certificate("new_${requests.size}", input.studentId, input.type).copy(purpose = input.purpose))
    }

    override suspend fun approve(id: String): AppResult<CertificateDecision> {
        blocks[id]?.let { return AppResult.Success(CertificateDecision.Blocked(it)) }
        val updated = all.first { it.id == id }.copy(status = CertificateStatus.APPROVED)
        all = all.map { if (it.id == id) updated else it }
        return AppResult.Success(CertificateDecision.Done(updated))
    }

    override suspend fun reject(id: String, reason: String): AppResult<Certificate> {
        rejects += id to reason
        return AppResult.Success(all.first { it.id == id }.copy(status = CertificateStatus.REJECTED, reason = reason))
    }

    override suspend fun certificate(id: String): AppResult<Certificate> = AppResult.Success(all.first { it.id == id })

    override suspend fun issue(id: String, effectiveDate: String?): AppResult<CertificateDecision> {
        blocks[id]?.let { return AppResult.Success(CertificateDecision.Blocked(it)) }
        val updated = all.first { it.id == id }.copy(status = CertificateStatus.ISSUED, fileUrl = "https://files/$id.pdf")
        all = all.map { if (it.id == id) updated else it }
        return AppResult.Success(CertificateDecision.Done(updated))
    }

    override suspend fun reissue(id: String, reason: String): AppResult<Certificate> =
        AppResult.Success(all.first { it.id == id }.copy(id = "${id}_dup", duplicate = true, reissueReason = reason))

    override suspend fun pdfUrl(jobId: String): AppResult<String> = AppResult.Success("https://files/$jobId.pdf")
}

internal class FakeStudentsRepository(private val list: List<StudentSummary> = emptyList()) : StudentsRepository {
    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> = AppResult.Success(list)

    override suspend fun student(id: String): AppResult<StudentDetail> = error("not used")
}

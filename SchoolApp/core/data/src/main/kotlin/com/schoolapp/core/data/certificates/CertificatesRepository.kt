package com.schoolapp.core.data.certificates

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateStatus

interface CertificatesRepository {
    /** Newest first; parents see only their children (server-side). */
    suspend fun certificates(studentId: String? = null, status: CertificateStatus? = null, branchId: String? = null): AppResult<List<Certificate>>

    suspend fun request(input: CertificateInput): AppResult<Certificate>

    /** `409 CLEARANCE_REQUIRED` comes back as [CertificateDecision.Blocked] with the reasons. */
    suspend fun approve(id: String): AppResult<CertificateDecision>

    suspend fun reject(id: String, reason: String): AppResult<Certificate>

    suspend fun certificate(id: String): AppResult<Certificate>

    /**
     * APPROVED -> ISSUED (serial + PDF job in [Certificate.jobId]). [effectiveDate] (yyyy-MM-dd) is for leaving
     * certificates only. `409 CLEARANCE_REQUIRED` comes back as [CertificateDecision.Blocked].
     */
    suspend fun issue(id: String, effectiveDate: String?): AppResult<CertificateDecision>

    /** Creates a DUPLICATE copy of an issued original; its PDF job is in [Certificate.jobId]. */
    suspend fun reissue(id: String, reason: String): AppResult<Certificate>

    /** Waits for the PDF job (about a minute at most) and returns the signed file url. */
    suspend fun pdfUrl(jobId: String): AppResult<String>
}

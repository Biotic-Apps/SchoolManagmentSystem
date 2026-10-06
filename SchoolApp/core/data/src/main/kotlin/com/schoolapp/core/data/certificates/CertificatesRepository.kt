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
}

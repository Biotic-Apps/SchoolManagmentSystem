package com.schoolapp.core.model.certificates

import com.schoolapp.core.model.common.PersonRef

enum class CertificateType { SCHOOL_LEAVING, TRANSFER, CHARACTER, ATTENDANCE, ACHIEVEMENT }

enum class CertificateStatus { REQUESTED, APPROVED, REJECTED, ISSUED }

data class Certificate(
    val id: String,
    val type: CertificateType,
    val status: CertificateStatus,
    val serial: String?,
    val studentId: String?,
    val studentName: String,
    val className: String?,
    val sectionName: String?,
    val purpose: String?,
    val requestedBy: PersonRef?,
    val createdAt: String?,
    val issuedOn: String?,
    val fileUrl: String?,
    val reason: String?,
    val duplicate: Boolean = false,
    val effectiveDate: String? = null,
    val reissueReason: String? = null,
    /** PDF job started by issue / reissue (null otherwise). */
    val jobId: String? = null,
) {
    /** Leaving and transfer certificates need clearance (no dues, no unreturned items). */
    val needsClearance: Boolean get() = type == CertificateType.SCHOOL_LEAVING || type == CertificateType.TRANSFER
}

/** [achievement] is required for ACHIEVEMENT certificates (sent as `details.achievement`). */
data class CertificateInput(val studentId: String, val type: CertificateType, val purpose: String?, val achievement: String? = null)

/** `409 CLEARANCE_REQUIRED` details. */
data class ClearanceBlock(val outstandingMinor: Long, val unreturnedItems: List<String>, val reasons: List<String>)

sealed interface CertificateDecision {
    data class Done(val certificate: Certificate) : CertificateDecision
    data class Blocked(val clearance: ClearanceBlock) : CertificateDecision
}

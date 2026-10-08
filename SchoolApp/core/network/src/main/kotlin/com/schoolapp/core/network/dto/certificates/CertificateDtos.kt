package com.schoolapp.core.network.dto.certificates

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class CertificateStudentDto(
    val id: String? = null,
    val name: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
)

@Serializable
data class CertificateDto(
    val id: String,
    val type: String? = null,
    val status: String? = null,
    val serial: String? = null,
    val serialNo: String? = null,
    val student: CertificateStudentDto? = null,
    val purpose: String? = null,
    val requestedBy: IdNameDto? = null,
    val createdAt: String? = null,
    val requestedAt: String? = null,
    val effectiveDate: String? = null,
    val issuedOn: String? = null,
    val issuedAt: String? = null,
    val fileUrl: String? = null,
    val reason: String? = null,
    val rejectReason: String? = null,
    val rejectionReason: String? = null,
    val duplicate: Boolean = false,
    val isDuplicate: Boolean = false,
)

@Serializable
data class CertificateBodyDto(val studentId: String, val type: String, val purpose: String? = null)

/** Details of `409 CLEARANCE_REQUIRED`. */
@Serializable
data class ClearanceDetailsDto(
    val outstandingMinor: Long? = null,
    val balanceMinor: Long? = null,
    val unreturnedItems: List<String> = emptyList(),
    val items: List<IdNameDto> = emptyList(),
    val reasons: List<String> = emptyList(),
)

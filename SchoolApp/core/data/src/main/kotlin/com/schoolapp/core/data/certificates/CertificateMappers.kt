package com.schoolapp.core.data.certificates

import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.certificates.ClearanceBlock
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.network.dto.certificates.CertificateDto
import com.schoolapp.core.network.dto.certificates.ClearanceDetailsDto
import kotlinx.serialization.json.Json

internal fun CertificateDto.toModel() = Certificate(
    id = id,
    type = enumOrDefault(type, CertificateType.CHARACTER),
    status = enumOrDefault(status, CertificateStatus.REQUESTED),
    serial = (serialNo ?: serial)?.takeIf(String::isNotBlank),
    studentId = student?.id,
    studentName = student?.name.orEmpty(),
    className = student?.className,
    sectionName = student?.sectionName,
    purpose = purpose?.takeIf(String::isNotBlank),
    requestedBy = requestedBy?.toRef(),
    createdAt = requestedAt ?: createdAt,
    issuedOn = issuedOn ?: issuedAt,
    fileUrl = fileUrl,
    reason = (rejectionReason ?: rejectReason ?: reason)?.takeIf(String::isNotBlank),
    duplicate = isDuplicate || duplicate,
)

/** Parses the `details` of `409 CLEARANCE_REQUIRED`; unknown shapes give an empty block. */
internal fun clearanceFrom(details: String?, json: Json): ClearanceBlock {
    val dto = details?.let { runCatching { json.decodeFromString(ClearanceDetailsDto.serializer(), it) }.getOrNull() }
        ?: ClearanceDetailsDto()
    return ClearanceBlock(
        outstandingMinor = dto.outstandingMinor ?: dto.balanceMinor ?: 0,
        unreturnedItems = dto.unreturnedItems + dto.items.mapNotNull { it.name },
        reasons = dto.reasons,
    )
}

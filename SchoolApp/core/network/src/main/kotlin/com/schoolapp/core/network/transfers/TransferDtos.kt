package com.schoolapp.core.network.transfers

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class TransferDto(
    val id: String,
    val student: TransferStudentDto? = null,
    val fromBranch: IdNameDto? = null,
    val toBranch: IdNameDto? = null,
    val effectiveDate: String? = null,
    val reason: String? = null,
    val status: String? = null,
    val decisionReason: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class TransferStudentDto(val id: String? = null, val name: String? = null, val admissionNo: String? = null)

@Serializable
data class AcceptTransferBodyDto(val sectionId: String)

@Serializable
data class TransferReasonBodyDto(val reason: String)

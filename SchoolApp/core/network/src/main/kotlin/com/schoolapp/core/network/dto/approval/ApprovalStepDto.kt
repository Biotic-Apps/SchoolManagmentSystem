package com.schoolapp.core.network.dto.approval

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ApprovalStepDto(
    val order: Int = 0,
    val approverRole: String? = null,
    val approverUserId: String? = null,
    val decision: String? = null,
    val comment: String? = null,
    val decidedAt: String? = null,
    val decidedBy: IdNameDto? = null,
)

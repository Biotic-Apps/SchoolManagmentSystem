package com.schoolapp.core.network.dto.approval

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ApprovalDto(
    val id: String,
    val type: String,
    val entityType: String? = null,
    val entityId: String? = null,
    val branchId: String? = null,
    val title: String? = null,
    val requestedBy: IdNameDto? = null,
    val status: String? = null,
    val currentStep: Int? = null,
    val createdAt: String? = null,
    val steps: List<ApprovalStepDto>? = null,
)

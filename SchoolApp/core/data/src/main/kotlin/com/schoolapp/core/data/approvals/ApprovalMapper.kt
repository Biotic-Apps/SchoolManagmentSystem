package com.schoolapp.core.data.approvals

import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.approval.ApprovalStep
import com.schoolapp.core.network.dto.approval.ApprovalDto
import com.schoolapp.core.network.dto.approval.ApprovalStepDto

internal fun ApprovalDto.toModel() = ApprovalRequest(
    id = id,
    type = type,
    entityType = entityType,
    title = title?.takeIf { it.isNotBlank() } ?: type,
    requestedById = requestedBy?.id,
    requestedByName = requestedBy?.name,
    status = ApprovalStatus.fromKey(status),
    currentStep = currentStep,
    createdAt = createdAt,
    steps = steps.orEmpty().sortedBy { it.order }.map { it.toModel() },
)

private fun ApprovalStepDto.toModel() = ApprovalStep(
    order = order,
    approverRole = approverRole,
    decision = decision,
    comment = comment,
    decidedAt = decidedAt,
    decidedByName = decidedBy?.name,
)

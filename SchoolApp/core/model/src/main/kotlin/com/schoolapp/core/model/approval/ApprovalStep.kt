package com.schoolapp.core.model.approval

data class ApprovalStep(
    val order: Int,
    val approverRole: String?,
    val decision: String?,
    val comment: String?,
    val decidedAt: String?,
    val decidedByName: String?,
)

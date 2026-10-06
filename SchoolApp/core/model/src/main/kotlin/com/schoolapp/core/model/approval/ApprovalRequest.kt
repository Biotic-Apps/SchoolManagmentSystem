package com.schoolapp.core.model.approval

data class ApprovalRequest(
    val id: String,
    val type: String,
    val entityType: String?,
    val title: String,
    val requestedById: String?,
    val requestedByName: String?,
    val status: ApprovalStatus,
    val currentStep: Int?,
    val createdAt: String?,
    val steps: List<ApprovalStep> = emptyList(),
    /** Flattened request payload (key -> display value) for the type-specific summary. */
    val details: List<Pair<String, String>> = emptyList(),
)

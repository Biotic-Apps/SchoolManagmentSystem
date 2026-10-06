package com.schoolapp.core.model.meeting

enum class FollowUpStatus { OPEN, DONE }

data class FollowUp(
    val id: String,
    val title: String,
    val ownerName: String?,
    val dueDate: String?,
    val status: FollowUpStatus,
    val studentName: String? = null,
)

data class FollowUpInput(val title: String, val ownerUserId: String?, val dueDate: String)

data class CompleteMeetingInput(
    val notes: String,
    val shareSummaryWithParent: Boolean,
    val summary: String?,
    val followUps: List<FollowUpInput>,
)

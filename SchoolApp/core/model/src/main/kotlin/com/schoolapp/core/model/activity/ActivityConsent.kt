package com.schoolapp.core.model.activity

data class ActivityConsent(
    val studentId: String,
    val studentName: String,
    val guardianName: String?,
    val status: ConsentStatus,
    val respondedAt: String?,
)

data class ActivityParticipant(
    val studentId: String,
    val studentName: String,
    val role: String?,
    val result: String?,
    val position: Int?,
    val remarks: String?,
)

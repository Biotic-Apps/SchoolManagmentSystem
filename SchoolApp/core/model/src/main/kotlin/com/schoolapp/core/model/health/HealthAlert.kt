package com.schoolapp.core.model.health

/** Student in a section with allergies or medical instructions (shown on the attendance roster). */
data class HealthAlert(
    val studentId: String,
    val studentName: String?,
    val allergies: List<String>,
    val conditions: List<String>,
    val instructions: String?,
)

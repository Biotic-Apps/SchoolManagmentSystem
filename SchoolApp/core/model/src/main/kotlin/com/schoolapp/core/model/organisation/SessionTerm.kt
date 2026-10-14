package com.schoolapp.core.model.organisation

/** A term inside an academic session; dates are `YYYY-MM-DD`. */
data class SessionTerm(
    val id: String,
    val sessionId: String,
    val name: String,
    val startDate: String,
    val endDate: String,
)

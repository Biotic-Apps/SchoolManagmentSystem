package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

/** POST /branches; null fields are left out of the body. */
@Serializable
data class CreateBranchRequest(
    val schoolId: String,
    val code: String,
    val name: String,
    val address: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val timings: BranchTimingsDto? = null,
    val workingDays: List<Int>? = null,
)

@Serializable
data class SetPrincipalRequest(val userId: String)

/** POST /sessions (with [branchId]) and PATCH /sessions/:id (without). */
@Serializable
data class SessionRequest(
    val branchId: String? = null,
    val name: String,
    val startDate: String,
    val endDate: String,
)

/** POST /sessions/:id/terms and PATCH /terms/:id. */
@Serializable
data class TermRequest(val name: String, val startDate: String, val endDate: String)

/** POST /calendar; [branchId] left out = whole-school entry. */
@Serializable
data class CreateCalendarEventRequest(
    val schoolId: String,
    val branchId: String? = null,
    val type: String,
    val title: String,
    val startDate: String,
    val endDate: String,
    val description: String? = null,
)

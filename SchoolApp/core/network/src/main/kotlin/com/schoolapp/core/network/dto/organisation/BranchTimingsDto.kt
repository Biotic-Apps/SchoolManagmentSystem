package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

@Serializable
data class BranchTimingsDto(
    val opensAt: String? = null,
    val closesAt: String? = null,
    val attendanceLockAt: String? = null,
)

package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

@Serializable
data class AcademicSessionDto(
    val id: String,
    val branchId: String? = null,
    val name: String,
    val startDate: String? = null,
    val endDate: String? = null,
    val status: String? = null,
    val termCount: Int = 0,
)

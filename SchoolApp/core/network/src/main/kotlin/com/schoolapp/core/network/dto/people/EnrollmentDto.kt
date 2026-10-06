package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

@Serializable
data class EnrollmentDto(
    val id: String,
    val branchId: String? = null,
    val branchName: String? = null,
    val sessionId: String? = null,
    val sessionName: String? = null,
    val sectionId: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val rollNo: Int? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val status: String? = null,
    val reason: String? = null,
)

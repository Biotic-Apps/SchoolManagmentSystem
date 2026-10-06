package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

@Serializable
data class StudentSummaryDto(
    val id: String,
    val admissionNo: String? = null,
    val name: String,
    val photoUrl: String? = null,
    val gender: String? = null,
    val dob: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val sectionId: String? = null,
    val branchName: String? = null,
    val rollNo: Int? = null,
    val status: String? = null,
    val primaryGuardian: PrimaryGuardianDto? = null,
)

@Serializable
data class PrimaryGuardianDto(val name: String? = null, val phone: String? = null)

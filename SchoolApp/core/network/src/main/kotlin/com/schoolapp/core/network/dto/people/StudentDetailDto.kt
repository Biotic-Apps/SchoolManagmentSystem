package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

/** StudentDetail extends StudentSummary on the server; the payload is flat, so summary fields repeat here. */
@Serializable
data class StudentDetailDto(
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
    val bForm: String? = null,
    val address: String? = null,
    val admissionDate: String? = null,
    val enrollment: EnrollmentDto? = null,
    val guardians: List<GuardianLinkDto> = emptyList(),
    val documents: List<DocumentDto> = emptyList(),
    val firstName: String? = null,
    val lastName: String? = null,
)

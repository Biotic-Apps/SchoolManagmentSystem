package com.schoolapp.core.network.dto.admissions

import com.schoolapp.core.network.dto.people.DocumentDto
import kotlinx.serialization.Serializable

@Serializable
data class ApplicationDto(
    val id: String,
    val applicationNo: String? = null,
    val branchId: String? = null,
    val sessionId: String? = null,
    val classId: String? = null,
    val status: String? = null,
    val className: String? = null,
    val child: ApplicationChildDto? = null,
    val guardians: List<ApplicantGuardianDto> = emptyList(),
    val medical: MedicalDto? = null,
    val notes: String? = null,
    val waitlistPosition: Int? = null,
    val test: AdmissionTestDto? = null,
    val documents: List<DocumentDto> = emptyList(),
    val decisionReason: String? = null,
    val studentId: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class ApplicationChildDto(
    val firstName: String? = null,
    val lastName: String? = null,
    val dob: String? = null,
    val gender: String? = null,
    val bForm: String? = null,
    val previousSchool: String? = null,
    val address: String? = null,
)

@Serializable
data class ApplicantGuardianDto(
    val name: String,
    val relation: String? = null,
    val phone: String? = null,
    val cnic: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
    val isPrimary: Boolean = false,
)

/** Read and write shape of the optional medical block (`allergies`, `conditions`, `notes`). */
@Serializable
data class MedicalDto(
    val allergies: String? = null,
    val conditions: String? = null,
    val notes: String? = null,
)

@Serializable
data class AdmissionTestDto(
    val scheduledAt: String? = null,
    val venue: String? = null,
    val score: Double? = null,
    val maxScore: Double? = null,
    val remarks: String? = null,
)

@Serializable
data class DecideBodyDto(val decision: String, val reason: String? = null)

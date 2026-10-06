package com.schoolapp.core.network.dto.health

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class HealthProfileDto(
    val bloodGroup: String? = null,
    val allergies: List<AllergyDto> = emptyList(),
    val conditions: List<String> = emptyList(),
    val medications: List<MedicationDto> = emptyList(),
    val instructions: String? = null,
    val doctor: DoctorDto? = null,
    val emergencyContacts: List<EmergencyContactDto> = emptyList(),
    val updatedAt: String? = null,
)

@Serializable
data class AllergyDto(val name: String = "", val severity: String? = null, val reaction: String? = null)

@Serializable
data class MedicationDto(val name: String = "", val dose: String? = null, val schedule: String? = null)

@Serializable
data class DoctorDto(val name: String? = null, val phone: String? = null)

@Serializable
data class EmergencyContactDto(val name: String = "", val relation: String? = null, val phone: String = "", val priority: Int = 0)

/** `POST /students/:id/health/change-requests` → `{ changes }`; absent keys stay unchanged. */
@Serializable
data class HealthChangeBodyDto(val changes: HealthChangesDto)

@Serializable
data class HealthChangesDto(
    val allergies: List<AllergyDto>? = null,
    val conditions: List<String>? = null,
    val instructions: String? = null,
    val emergencyContacts: List<EmergencyContactDto>? = null,
)

/** One row of `GET /health/alerts`; allergies may be names or `{ name, severity }` objects. */
@Serializable
data class HealthAlertDto(
    val studentId: String? = null,
    val student: IdNameDto? = null,
    val studentName: String? = null,
    val allergies: List<JsonElement> = emptyList(),
    val conditions: List<String> = emptyList(),
    val instructions: String? = null,
)

@Serializable
data class IncidentDto(
    val id: String,
    val student: IdNameDto? = null,
    val studentId: String? = null,
    val occurredAt: String = "",
    val type: String? = null,
    val severity: String? = null,
    val description: String? = null,
    val actionTaken: String? = null,
    val status: String? = null,
    val reportedBy: IdNameDto? = null,
)

@Serializable
data class IncidentBodyDto(
    val studentId: String,
    val occurredAt: String,
    val type: String,
    val severity: String,
    val description: String,
    val actionTaken: String,
    val attachmentFileIds: List<String>? = null,
)

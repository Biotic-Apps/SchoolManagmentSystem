package com.schoolapp.core.network.dto.students.detail

import com.schoolapp.core.network.dto.health.AllergyDto
import com.schoolapp.core.network.dto.health.DoctorDto
import com.schoolapp.core.network.dto.health.EmergencyContactDto
import com.schoolapp.core.network.dto.health.MedicationDto
import kotlinx.serialization.Serializable

/** Full body of `PUT /students/:id/health` (`health.edit`); omitted (null) fields are stored as empty. */
@Serializable
data class HealthProfileBodyDto(
    val bloodGroup: String? = null,
    val allergies: List<AllergyDto> = emptyList(),
    val conditions: List<String> = emptyList(),
    val medications: List<MedicationDto> = emptyList(),
    val instructions: String? = null,
    val doctor: DoctorDto? = null,
    val emergencyContacts: List<EmergencyContactDto> = emptyList(),
)

package com.schoolapp.core.data.health

import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.data.common.string
import com.schoolapp.core.data.common.toAttachments
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.health.Allergy
import com.schoolapp.core.model.health.EmergencyContact
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.health.HealthChangeInput
import com.schoolapp.core.model.health.HealthContact
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentInput
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.core.model.health.Medication
import com.schoolapp.core.network.dto.health.AllergyDto
import com.schoolapp.core.network.dto.health.EmergencyContactDto
import com.schoolapp.core.network.dto.health.HealthAlertDto
import com.schoolapp.core.network.dto.health.HealthChangeBodyDto
import com.schoolapp.core.network.dto.health.HealthChangesDto
import com.schoolapp.core.network.dto.health.HealthProfileDto
import com.schoolapp.core.network.dto.health.IncidentBodyDto
import com.schoolapp.core.network.dto.health.IncidentDto
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

internal fun HealthProfileDto?.toModel(): HealthProfile {
    val dto = this ?: HealthProfileDto()
    return HealthProfile(
        bloodGroup = dto.bloodGroup,
        allergies = dto.allergies.map { Allergy(it.name, it.severity, it.reaction) },
        conditions = dto.conditions,
        medications = dto.medications.map { Medication(it.name, it.dose, it.schedule) },
        instructions = dto.instructions,
        doctor = dto.doctor?.let { d -> d.name?.let { HealthContact(it, d.phone.orEmpty()) } },
        emergencyContacts = dto.emergencyContacts
            .map { EmergencyContact(it.name, it.relation, it.phone, it.priority) }
            .sortedBy { it.priority },
        updatedAt = dto.updatedAt,
    )
}

internal fun HealthAlertDto.toModel(): HealthAlert? {
    val id = studentId ?: student?.id ?: return null
    return HealthAlert(
        studentId = id,
        studentName = student?.name ?: studentName,
        allergies = allergies.mapNotNull { element ->
            when (element) {
                is JsonPrimitive -> element.content.takeIf { element.isString }
                is JsonObject -> element.string("name")
                else -> null
            }
        },
        conditions = conditions,
        instructions = instructions,
    )
}

internal fun IncidentDto.toModel() = Incident(
    id = id,
    studentId = student?.id ?: studentId,
    studentName = student?.name,
    occurredAt = occurredAt,
    type = enumOrDefault(type, IncidentType.OTHER),
    severity = enumOrDefault(severity, IncidentSeverity.MINOR),
    description = description.orEmpty(),
    actionTaken = actionTaken,
    status = status,
    reportedByName = reportedBy?.name,
    attachments = attachments.toAttachments(),
)

internal fun IncidentInput.toBody() = IncidentBodyDto(
    studentId = studentId,
    occurredAt = occurredAt,
    type = type.name,
    severity = severity.name,
    description = description.trim(),
    actionTaken = actionTaken.trim(),
    attachmentFileIds = attachmentFileIds.orNullIfEmpty(),
)

internal fun HealthChangeInput.toBody() = HealthChangeBodyDto(
    HealthChangesDto(
        allergies = allergies?.map { AllergyDto(it.name, it.severity, it.reaction) },
        conditions = conditions,
        instructions = instructions,
        emergencyContacts = emergencyContacts?.map { EmergencyContactDto(it.name, it.relation, it.phone, it.priority) },
    ),
)

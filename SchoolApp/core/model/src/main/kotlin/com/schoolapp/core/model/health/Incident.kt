package com.schoolapp.core.model.health

import com.schoolapp.core.model.files.Attachment

enum class IncidentType { INJURY, ILLNESS, ALLERGIC_REACTION, OTHER }

enum class IncidentSeverity { MINOR, MODERATE, SERIOUS }

data class Incident(
    val id: String,
    val studentId: String?,
    val studentName: String?,
    /** ISO timestamp. */
    val occurredAt: String,
    val type: IncidentType,
    val severity: IncidentSeverity,
    val description: String,
    val actionTaken: String?,
    val status: String?,
    val reportedByName: String?,
    val attachments: List<Attachment> = emptyList(),
)

data class IncidentInput(
    val studentId: String,
    /** ISO timestamp (UTC). */
    val occurredAt: String,
    val type: IncidentType,
    val severity: IncidentSeverity,
    val description: String,
    val actionTaken: String,
    val attachmentFileIds: List<String> = emptyList(),
)

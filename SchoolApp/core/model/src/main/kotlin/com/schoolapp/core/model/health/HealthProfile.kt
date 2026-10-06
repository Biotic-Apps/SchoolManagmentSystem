package com.schoolapp.core.model.health

data class Allergy(val name: String, val severity: String?, val reaction: String?)

data class Medication(val name: String, val dose: String?, val schedule: String?)

data class HealthContact(val name: String, val phone: String)

data class EmergencyContact(val name: String, val relation: String?, val phone: String, val priority: Int)

data class HealthProfile(
    val bloodGroup: String?,
    val allergies: List<Allergy>,
    val conditions: List<String>,
    val medications: List<Medication>,
    val instructions: String?,
    val doctor: HealthContact?,
    val emergencyContacts: List<EmergencyContact>,
    val updatedAt: String?,
)

/** Parent proposal (`POST /students/:id/health/change-requests`); null fields are unchanged. */
data class HealthChangeInput(
    val allergies: List<Allergy>? = null,
    val conditions: List<String>? = null,
    val instructions: String? = null,
    val emergencyContacts: List<EmergencyContact>? = null,
)

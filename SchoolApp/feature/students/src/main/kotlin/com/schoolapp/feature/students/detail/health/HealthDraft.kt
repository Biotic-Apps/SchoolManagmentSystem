package com.schoolapp.feature.students.detail.health

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.health.Allergy
import com.schoolapp.core.model.health.EmergencyContact
import com.schoolapp.core.model.health.HealthContact
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Medication

internal data class AllergyDraft(val name: String = "", val severity: String = "", val reaction: String = "")

internal data class MedicationDraft(val name: String = "", val dose: String = "", val schedule: String = "")

internal data class ContactDraft(val name: String = "", val relation: String = "", val phone: String = "")

internal enum class HealthProblem { REQUIRED, TOO_LONG, PHONE }

/** Staff editor of the whole health profile (`PUT /students/:id/health`); limits follow the API DTO. */
@Immutable
internal data class HealthDraft(
    val bloodGroup: String = "",
    val allergies: List<AllergyDraft> = emptyList(),
    val conditions: List<String> = emptyList(),
    val medications: List<MedicationDraft> = emptyList(),
    val instructions: String = "",
    val doctorName: String = "",
    val doctorPhone: String = "",
    val contacts: List<ContactDraft> = emptyList(),
    val showErrors: Boolean = false,
    val saving: Boolean = false,
    val error: AppError? = null,
) {
    /** Field key (`allergies.0.name`, `doctorPhone`, ...) -> problem. */
    val problems: Map<String, HealthProblem>
        get() = buildMap {
            allergies.forEachIndexed { i, a ->
                text("allergies.$i.name", a.name, NAME_MAX, required = true)
                if (a.severity.isBlank()) put("allergies.$i.severity", HealthProblem.REQUIRED)
                text("allergies.$i.reaction", a.reaction, REACTION_MAX)
            }
            conditions.forEachIndexed { i, c -> text("conditions.$i", c, CONDITION_MAX, required = true) }
            medications.forEachIndexed { i, m ->
                text("medications.$i.name", m.name, NAME_MAX, required = true)
                text("medications.$i.dose", m.dose, NAME_MAX)
                text("medications.$i.schedule", m.schedule, CONDITION_MAX)
            }
            text("instructions", instructions, INSTRUCTIONS_MAX)
            text("doctorName", doctorName, NAME_MAX)
            if (doctorName.isNotBlank()) phone("doctorPhone", doctorPhone)
            contacts.forEachIndexed { i, c ->
                text("contacts.$i.name", c.name, NAME_MAX, required = true)
                text("contacts.$i.relation", c.relation, RELATION_MAX, required = true)
                phone("contacts.$i.phone", c.phone)
            }
        }

    fun errorOf(key: String): HealthProblem? = if (showErrors) problems[key] else null

    fun toProfile() = HealthProfile(
        bloodGroup = bloodGroup.ifBlank { null },
        allergies = allergies.map { Allergy(it.name, it.severity, it.reaction) },
        conditions = conditions,
        medications = medications.map { Medication(it.name, it.dose, it.schedule) },
        instructions = instructions,
        doctor = doctorName.trim().takeIf { it.isNotEmpty() }?.let { HealthContact(it, doctorPhone) },
        emergencyContacts = contacts.mapIndexed { i, c -> EmergencyContact(c.name, c.relation, c.phone, i + 1) },
        updatedAt = null,
    )

    companion object {
        const val NAME_MAX = 100
        const val REACTION_MAX = 300
        const val CONDITION_MAX = 200
        const val RELATION_MAX = 50
        const val INSTRUCTIONS_MAX = 2000
        val BloodGroups = listOf("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
        val Severities = listOf("MILD", "MODERATE", "SEVERE")
        private val PhonePattern = Regex("^\\+?[0-9][0-9 -]{3,18}[0-9]$")

        fun from(profile: HealthProfile?) = HealthDraft(
            bloodGroup = profile?.bloodGroup.orEmpty(),
            allergies = profile?.allergies.orEmpty().map { AllergyDraft(it.name, it.severity.orEmpty(), it.reaction.orEmpty()) },
            conditions = profile?.conditions.orEmpty(),
            medications = profile?.medications.orEmpty().map { MedicationDraft(it.name, it.dose.orEmpty(), it.schedule.orEmpty()) },
            instructions = profile?.instructions.orEmpty(),
            doctorName = profile?.doctor?.name.orEmpty(),
            doctorPhone = profile?.doctor?.phone.orEmpty(),
            contacts = profile?.emergencyContacts.orEmpty().sortedBy { it.priority }
                .map { ContactDraft(it.name, it.relation.orEmpty(), it.phone) },
        )

        private fun MutableMap<String, HealthProblem>.text(key: String, value: String, max: Int, required: Boolean = false) {
            val trimmed = value.trim()
            when {
                required && trimmed.isEmpty() -> put(key, HealthProblem.REQUIRED)
                trimmed.length > max -> put(key, HealthProblem.TOO_LONG)
            }
        }

        private fun MutableMap<String, HealthProblem>.phone(key: String, value: String) {
            val trimmed = value.trim()
            when {
                trimmed.isEmpty() -> put(key, HealthProblem.REQUIRED)
                !PhonePattern.matches(trimmed) -> put(key, HealthProblem.PHONE)
            }
        }
    }
}

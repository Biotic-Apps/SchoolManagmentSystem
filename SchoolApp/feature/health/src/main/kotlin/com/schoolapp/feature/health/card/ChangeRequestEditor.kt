package com.schoolapp.feature.health.card

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.health.Allergy
import com.schoolapp.core.model.health.EmergencyContact
import com.schoolapp.core.model.health.HealthChangeInput

@Immutable
data class AllergyDraft(val key: Long, val name: String = "", val severity: String = "", val reaction: String = "")

@Immutable
data class ContactDraft(val key: Long, val name: String = "", val relation: String = "", val phone: String = "")

/** Parent's "Request a change" sheet; [showErrors] turns on field errors after a failed submit. */
@Immutable
data class ChangeRequestEditor(
    val instructions: String,
    val allergies: List<AllergyDraft>,
    val contacts: List<ContactDraft>,
    val showErrors: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val isValid: Boolean
        get() = allergies.all { it.name.isNotBlank() } && contacts.all { it.name.isNotBlank() && it.phone.isNotBlank() }

    /** Contacts keep the order shown; that order becomes their call priority. */
    fun toInput(): HealthChangeInput = HealthChangeInput(
        allergies = allergies.map { Allergy(it.name.trim(), it.severity.ifBlank { null }, it.reaction.trim().ifBlank { null }) },
        instructions = instructions.trim(),
        emergencyContacts = contacts.mapIndexed { index, contact ->
            EmergencyContact(contact.name.trim(), contact.relation.trim().ifBlank { null }, contact.phone.trim(), index + 1)
        },
    )
}

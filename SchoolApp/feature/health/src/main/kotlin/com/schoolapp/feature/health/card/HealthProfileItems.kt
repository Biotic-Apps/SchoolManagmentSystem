package com.schoolapp.feature.health.card

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.ui.ExternalActions
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.components.AllergyAlertCard
import com.schoolapp.feature.health.components.BodyText
import com.schoolapp.feature.health.components.EmergencyContactCard
import com.schoolapp.feature.health.components.HealthSectionCard

/** Health card body in the order staff need it in an emergency (allergies first). */
internal fun LazyListScope.healthProfileItems(profile: HealthProfile, actions: ExternalActions) {
    if (profile.allergies.isNotEmpty()) {
        item(key = "allergies") { AllergyAlertCard(profile.allergies) }
    }
    profile.instructions?.takeIf { it.isNotBlank() }?.let { instructions ->
        item(key = "instructions") {
            HealthSectionCard(stringResource(R.string.health_instructions)) { BodyText(instructions) }
        }
    }
    item(key = "conditions") {
        HealthSectionCard(stringResource(R.string.health_conditions)) {
            if (profile.conditions.isEmpty()) {
                BodyText(stringResource(R.string.health_none_recorded), color = AppColors.TextSecondary)
            } else {
                profile.conditions.forEach { BodyText("• $it") }
            }
        }
    }
    item(key = "medications") {
        HealthSectionCard(stringResource(R.string.health_medications)) {
            if (profile.medications.isEmpty()) {
                BodyText(stringResource(R.string.health_none_recorded), color = AppColors.TextSecondary)
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    profile.medications.forEach { medication ->
                        Column {
                            Text(medication.name, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
                            medication.dose?.takeIf { it.isNotBlank() }?.let {
                                Text(stringResource(R.string.health_medication_dose, it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                            }
                            medication.schedule?.takeIf { it.isNotBlank() }?.let {
                                Text(stringResource(R.string.health_medication_schedule, it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                            }
                        }
                    }
                }
            }
        }
    }
    item(key = "blood_group") {
        HealthSectionCard(stringResource(R.string.health_blood_group)) {
            val group = profile.bloodGroup?.takeIf { it.isNotBlank() }
            BodyText(group ?: stringResource(R.string.health_not_recorded), color = if (group == null) AppColors.TextSecondary else AppColors.TextPrimary)
        }
    }
    profile.doctor?.let { doctor ->
        item(key = "doctor_header") { SectionHeader(stringResource(R.string.health_doctor)) }
        item(key = "doctor") {
            EmergencyContactCard(
                name = doctor.name,
                relation = null,
                phone = doctor.phone,
                priority = null,
                onCall = { actions.dial(doctor.phone) },
                onSms = null,
            )
        }
    }
    item(key = "contacts_header") {
        SectionHeader(stringResource(R.string.health_emergency_contacts), subtitle = stringResource(R.string.health_emergency_contacts_subtitle))
    }
    if (profile.emergencyContacts.isEmpty()) {
        item(key = "contacts_empty") { BodyText(stringResource(R.string.health_none_recorded), color = AppColors.TextSecondary) }
    }
    profile.emergencyContacts.forEachIndexed { index, contact ->
        item(key = "contact_$index") {
            EmergencyContactCard(
                name = contact.name,
                relation = contact.relation,
                phone = contact.phone,
                priority = contact.priority,
                onCall = { actions.dial(contact.phone) },
                onSms = { actions.sms(contact.phone) },
            )
        }
    }
    profile.updatedAt?.let { updatedAt ->
        item(key = "updated") {
            Text(
                stringResource(R.string.health_last_updated, formatTimestamp(updatedAt) ?: formatDate(updatedAt).orEmpty()),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
    }
}

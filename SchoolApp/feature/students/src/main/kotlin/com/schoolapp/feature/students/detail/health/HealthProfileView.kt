package com.schoolapp.feature.students.detail.health

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Medication
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/** Read-only health profile cards (web HealthProfileView). */
internal fun LazyListScope.healthProfileItems(profile: HealthProfile, onCall: (String) -> Unit) {
    item(key = "general") {
        HealthCard(R.string.sd_health_general) {
            KeyValueRow(stringResource(R.string.sd_health_blood_group), profile.bloodGroup ?: stringResource(R.string.sd_health_not_known))
            val doctor = profile.doctor
            if (doctor == null) {
                KeyValueRow(stringResource(R.string.sd_health_doctor), stringResource(R.string.sd_health_none))
            } else {
                ListItemRow(
                    title = doctor.name,
                    supporting = listOf(stringResource(R.string.sd_health_doctor), doctor.phone).joinToString(" · "),
                    trailing = { CallButton(doctor.phone, doctor.name, onCall) },
                )
            }
        }
    }
    item(key = "allergies") {
        HealthCard(R.string.sd_health_allergies) {
            if (profile.allergies.isEmpty()) Muted(stringResource(R.string.sd_health_no_allergies))
            profile.allergies.forEach { allergy ->
                ListItemRow(
                    title = allergy.name,
                    supporting = allergy.reaction,
                    leadingIcon = Icons.Outlined.Warning,
                    trailing = allergy.severity?.let { { StatusChip(humanizeKey(it), severityTone(it)) } },
                )
            }
        }
    }
    item(key = "conditions") {
        HealthCard(R.string.sd_health_conditions) {
            if (profile.conditions.isEmpty()) Muted(stringResource(R.string.sd_health_no_conditions))
            profile.conditions.forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary) }
        }
    }
    item(key = "medications") {
        HealthCard(R.string.sd_health_medications) {
            if (profile.medications.isEmpty()) Muted(stringResource(R.string.sd_health_no_medications))
            profile.medications.forEach { med ->
                val supporting = listOfNotNull(med.dose, med.schedule).joinToString(" · ").ifBlank { null }
                ListItemRow(title = med.name, supporting = supporting, leadingIcon = Icons.Outlined.Medication)
            }
        }
    }
    item(key = "instructions") {
        HealthCard(R.string.sd_health_instructions) {
            val text = profile.instructions?.takeIf { it.isNotBlank() }
            if (text == null) Muted(stringResource(R.string.sd_health_no_instructions)) else {
                Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            }
        }
    }
    item(key = "contacts") {
        HealthCard(R.string.sd_health_contacts) {
            if (profile.emergencyContacts.isEmpty()) Muted(stringResource(R.string.sd_health_no_contacts))
            profile.emergencyContacts.forEachIndexed { index, contact ->
                ListItemRow(
                    title = "${index + 1}. ${contact.name}",
                    supporting = listOfNotNull(contact.relation, contact.phone).joinToString(" · "),
                    trailing = { CallButton(contact.phone, contact.name, onCall) },
                )
            }
        }
    }
}

internal fun severityTone(severity: String): StatusTone = when (severity.uppercase()) {
    "MILD", "MINOR" -> StatusTone.Info
    "MODERATE" -> StatusTone.Warning
    "SEVERE", "SERIOUS" -> StatusTone.Error
    else -> StatusTone.Neutral
}

@Composable
internal fun HealthCard(title: Int, content: @Composable () -> Unit) {
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(title))
        content()
    }
}

@Composable
internal fun Muted(text: String) {
    Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
}

@Composable
private fun CallButton(phone: String, name: String, onCall: (String) -> Unit) {
    if (phone.isBlank()) return
    IconButton(onClick = { onCall(phone) }) {
        Icon(Icons.Outlined.Call, stringResource(R.string.sd_call, name), tint = AppColors.Primary)
    }
}

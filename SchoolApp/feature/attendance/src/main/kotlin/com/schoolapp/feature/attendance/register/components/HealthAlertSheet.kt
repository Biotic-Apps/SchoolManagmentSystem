package com.schoolapp.feature.attendance.register.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.feature.attendance.R

/** Allergies and medical instructions for one student, with a shortcut to the full health card. */
@Composable
internal fun HealthAlertSheet(
    alert: HealthAlert,
    studentName: String,
    onOpenHealthCard: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = alert.studentName ?: studentName, onDismiss = onDismiss) {
        if (alert.allergies.isNotEmpty()) {
            KeyValueRow(stringResource(R.string.attendance_allergies), alert.allergies.joinToString(", "))
        }
        if (alert.conditions.isNotEmpty()) {
            KeyValueRow(stringResource(R.string.attendance_conditions), alert.conditions.joinToString(", "))
        }
        alert.instructions?.takeIf { it.isNotBlank() }?.let {
            KeyValueRow(stringResource(R.string.attendance_instructions), it)
        }
        SecondaryButton(stringResource(R.string.attendance_open_health_card), onOpenHealthCard)
    }
}

package com.schoolapp.feature.activities.propose

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.feature.activities.R

/** The one open date/time dialog of the propose form. */
@Composable
internal fun ProposePickers(picker: ProposePicker?, form: ProposeForm, onDismiss: () -> Unit, actions: ProposeActions) {
    when (picker) {
        null -> Unit
        ProposePicker.DATE -> AppDatePickerDialog(
            initialDate = form.date,
            onConfirm = { onDismiss(); actions.onDate(it) },
            onDismiss = onDismiss,
        )
        ProposePicker.DEADLINE -> AppDatePickerDialog(
            initialDate = form.consentDeadline ?: form.date,
            onConfirm = { onDismiss(); actions.onDeadline(it) },
            onDismiss = onDismiss,
        )
        ProposePicker.START -> AppTimePickerDialog(
            initialTime = form.startTime,
            onConfirm = { onDismiss(); actions.onStartTime(it) },
            onDismiss = onDismiss,
            title = stringResource(R.string.activities_field_start_time),
        )
        ProposePicker.END -> AppTimePickerDialog(
            initialTime = form.endTime ?: form.startTime,
            onConfirm = { onDismiss(); actions.onEndTime(it) },
            onDismiss = onDismiss,
            title = stringResource(R.string.activities_field_end_time),
        )
    }
}

internal enum class ProposePicker { DATE, START, END, DEADLINE }

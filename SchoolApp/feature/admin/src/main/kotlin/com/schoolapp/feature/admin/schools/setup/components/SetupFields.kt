package com.schoolapp.feature.admin.schools.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.admin.schools.setup.model.SetupError

/** Text of a field error, local or from the server. */
@Composable
@ReadOnlyComposable
internal fun setupErrorText(error: SetupError?): String? = when (error) {
    null -> null
    is SetupError.Local -> stringResource(error.res)
    is SetupError.Server -> error.text
}

/** A titled card grouping a few fields of a step (web FormPanel). */
@Composable
internal fun SetupPanel(title: String, modifier: Modifier = Modifier, description: String? = null, content: @Composable () -> Unit) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
            description?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        }
        content()
    }
}

/** "HH:mm" picked with the 12-hour clock dialog and shown as "8:00 AM". */
@Composable
internal fun TimeField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier, hint: String? = null, error: String? = null) {
    var open by rememberSaveable { mutableStateOf(false) }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(2.dp)) {
        PickerField(formatTime(value).orEmpty(), label, onClick = { open = true }, errorText = error, icon = Icons.Outlined.Schedule, modifier = Modifier.fillMaxWidth())
        if (error == null && hint != null) Text(hint, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
    }
    if (open) {
        AppTimePickerDialog(
            initialTime = value,
            onConfirm = {
                open = false
                onChange(it)
            },
            onDismiss = { open = false },
            title = label,
        )
    }
}

/** "yyyy-MM-dd" picked with the calendar dialog. */
@Composable
internal fun DateField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier, error: String? = null) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(formatDate(value).orEmpty(), label, onClick = { open = true }, errorText = error, icon = Icons.Outlined.CalendarMonth, modifier = modifier)
    if (open) {
        AppDatePickerDialog(
            initialDate = value,
            onConfirm = {
                open = false
                onChange(it)
            },
            onDismiss = { open = false },
        )
    }
}

/** A labelled − value + stepper row. */
@Composable
internal fun StepperRow(
    label: String,
    value: Int,
    onChange: (Int) -> Unit,
    min: Int,
    max: Int,
    modifier: Modifier = Modifier,
    hint: String? = null,
    error: String? = null,
) {
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(label, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            hint?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
            error?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
        }
        NumberStepper(value = value, onValueChange = onChange, label = label, min = min, max = max)
    }
}

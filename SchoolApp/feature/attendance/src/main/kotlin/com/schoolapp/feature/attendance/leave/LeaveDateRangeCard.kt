package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.attendance.R

private enum class DateField { FROM, TO }

/** First and last day side by side, with the calendar-day count; the last day cannot be before the first. */
@Composable
internal fun LeaveDateRangeCard(
    form: LeaveForm,
    today: String,
    onFromChange: (String) -> Unit,
    onToChange: (String) -> Unit,
    enabled: Boolean,
    modifier: Modifier = Modifier,
) {
    var picking by rememberSaveable { mutableStateOf<DateField?>(null) }
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PickerField(
                value = formatDate(form.from).orEmpty(),
                label = stringResource(R.string.attendance_leave_from),
                onClick = { picking = DateField.FROM },
                enabled = enabled,
                icon = Icons.Outlined.EventBusy,
                errorText = if (form.fromMissing) stringResource(R.string.attendance_leave_date_required) else null,
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatDate(form.to).orEmpty(),
                label = stringResource(R.string.attendance_leave_to),
                onClick = { picking = DateField.TO },
                enabled = enabled,
                icon = Icons.Outlined.EventAvailable,
                errorText = when {
                    form.toMissing -> stringResource(R.string.attendance_leave_date_required)
                    form.rangeInvalid -> stringResource(R.string.attendance_leave_range_invalid)
                    else -> null
                },
                modifier = Modifier.weight(1f),
            )
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            form.calendarDays?.let { days ->
                StatusChip(pluralStringResource(R.plurals.leave_form_days, days, days), StatusTone.Info)
            }
            Text(
                stringResource(R.string.leave_form_days_note),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                modifier = Modifier.weight(1f),
            )
        }
    }
    picking?.let { field ->
        val isFrom = field == DateField.FROM
        AppDatePickerDialog(
            initialDate = (if (isFrom) form.from else form.to).ifBlank { form.from }.ifBlank { today },
            minDate = if (isFrom) null else form.from.ifBlank { null },
            onConfirm = {
                picking = null
                if (isFrom) onFromChange(it) else onToChange(it)
            },
            onDismiss = { picking = null },
        )
    }
}

package com.schoolapp.feature.attendance.staffmark.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.staffmark.StaffRowUi

/** Callbacks of the details sheet; each change is applied to the row straight away (like the web inline cells). */
internal class StaffDetailsActions(
    val onCheckIn: (String) -> Unit,
    val onCheckOut: (String) -> Unit,
    val onClearTimes: () -> Unit,
    val onRemark: (String) -> Unit,
    val onDone: () -> Unit,
)

private enum class TimeField { CHECK_IN, CHECK_OUT }

@Composable
internal fun StaffDetailsSheet(row: StaffRowUi, actions: StaffDetailsActions) {
    var picking by rememberSaveable { mutableStateOf<TimeField?>(null) }
    val notSet = stringResource(R.string.attendance_time_not_set)
    AppBottomSheet(title = row.name, onDismiss = actions.onDone) {
        if (!row.timesEnabled) {
            Text(
                stringResource(R.string.attendance_staff_no_times),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PickerField(
                value = formatTime(row.checkIn) ?: notSet,
                label = stringResource(R.string.attendance_check_in_label),
                onClick = { picking = TimeField.CHECK_IN },
                enabled = row.timesEnabled,
                icon = Icons.Outlined.Schedule,
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatTime(row.checkOut) ?: notSet,
                label = stringResource(R.string.attendance_check_out_label),
                onClick = { picking = TimeField.CHECK_OUT },
                enabled = row.timesEnabled,
                icon = Icons.Outlined.Schedule,
                modifier = Modifier.weight(1f),
            )
        }
        if (row.timesEnabled && (row.checkIn != null || row.checkOut != null)) {
            AppTextButton(text = stringResource(R.string.attendance_clear_times), onClick = actions.onClearTimes)
        }
        AppTextField(
            value = row.remark.orEmpty(),
            onValueChange = actions.onRemark,
            label = stringResource(R.string.attendance_remark),
            placeholder = stringResource(R.string.attendance_remark_optional),
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(text = stringResource(R.string.attendance_done), onClick = actions.onDone, modifier = Modifier.fillMaxWidth())
    }
    picking?.let { field ->
        AppTimePickerDialog(
            initialTime = if (field == TimeField.CHECK_IN) row.checkIn else row.checkOut,
            title = stringResource(if (field == TimeField.CHECK_IN) R.string.attendance_check_in_label else R.string.attendance_check_out_label),
            onConfirm = { time ->
                picking = null
                if (field == TimeField.CHECK_IN) actions.onCheckIn(time) else actions.onCheckOut(time)
            },
            onDismiss = { picking = null },
        )
    }
}

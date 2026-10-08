package com.schoolapp.feature.timetable.bell

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R

/** One bell row: "Period N" or a break with its label, start/end times (12-hour pickers), break switch, delete. */
@Composable
internal fun BellRowCard(index: Int, number: Int?, row: BellRow, problem: RowProblem?, viewModel: BellScheduleViewModel) {
    AppCard(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                if (row.isBreak) row.label.ifBlank { stringResource(R.string.tt_break) } else stringResource(R.string.tt_period_n, number ?: 0),
                style = MaterialTheme.typography.titleMedium,
                color = if (row.isBreak) AppColors.TextSecondary else AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            Text(stringResource(R.string.tt_break), style = MaterialTheme.typography.bodyMedium)
            Switch(checked = row.isBreak, onCheckedChange = { viewModel.setBreak(index, it) }, modifier = Modifier.padding(horizontal = 8.dp))
            IconButton(onClick = { viewModel.removeRow(index) }) {
                Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.tt_remove_row), tint = AppColors.TextSecondary)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            TimeField(stringResource(R.string.tt_starts), row.startTime, Modifier.weight(1f), null) { viewModel.setStart(index, it) }
            val error = when (problem) {
                RowProblem.END_BEFORE_START -> stringResource(R.string.tt_end_after_start)
                RowProblem.OVERLAPS_PREVIOUS -> stringResource(R.string.tt_overlaps)
                null -> null
            }
            TimeField(stringResource(R.string.tt_ends), row.endTime, Modifier.weight(1f), error) { viewModel.setEnd(index, it) }
        }
        if (row.isBreak) {
            AppTextField(
                value = row.label,
                onValueChange = { viewModel.setLabel(index, it) },
                label = stringResource(R.string.tt_break_label),
                placeholder = stringResource(R.string.tt_break_label_hint),
                kind = FieldKind.Title,
            )
        }
    }
}

@Composable
private fun TimeField(label: String, value: String, modifier: Modifier, error: String?, onPick: (String) -> Unit) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = TimeFormat.formatTime12(value),
        label = label,
        onClick = { open = true },
        modifier = modifier,
        errorText = error,
        icon = Icons.Outlined.Schedule,
    )
    if (open) {
        AppTimePickerDialog(
            initialTime = value,
            onConfirm = {
                open = false
                onPick(it)
            },
            onDismiss = { open = false },
            title = label,
        )
    }
}

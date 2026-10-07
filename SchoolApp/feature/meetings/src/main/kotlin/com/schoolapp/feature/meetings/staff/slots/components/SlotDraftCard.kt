package com.schoolapp.feature.meetings.staff.slots.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.labelRes
import com.schoolapp.feature.meetings.domain.SlotDraft
import com.schoolapp.feature.meetings.domain.SlotProblem

/** Which picker a draft row asked for. */
internal enum class SlotPickerField { DATE, START, END }

/** One row of the "Add slots" sheet: date, start and end (12-hour pickers), mode chips and an optional location. */
@Composable
internal fun SlotDraftCard(
    number: Int,
    draft: SlotDraft,
    problems: Set<SlotProblem>,
    enabled: Boolean,
    removable: Boolean,
    onPick: (SlotPickerField) -> Unit,
    onModeChange: (MeetingMode) -> Unit,
    onLocationChange: (String) -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, AppColors.Border),
        color = AppColors.Surface,
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    stringResource(R.string.meetings_slot_number, number),
                    style = MaterialTheme.typography.titleSmall,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                if (removable) {
                    IconButton(onClick = onRemove, enabled = enabled) {
                        Icon(Icons.Outlined.Delete, stringResource(R.string.meetings_remove_slot_row), tint = AppColors.Error)
                    }
                }
            }
            PickerField(
                value = formatDate(draft.date).orEmpty(),
                label = stringResource(R.string.meetings_date),
                onClick = { onPick(SlotPickerField.DATE) },
                enabled = enabled,
                errorText = stringResource(R.string.meetings_error_slot_date_past).takeIf { SlotProblem.DATE_PAST in problems },
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PickerField(
                    value = formatTime(draft.startTime).orEmpty(),
                    label = stringResource(R.string.meetings_slot_start),
                    onClick = { onPick(SlotPickerField.START) },
                    enabled = enabled,
                    icon = Icons.Outlined.Schedule,
                    errorText = startError(problems),
                    modifier = Modifier.weight(1f),
                )
                PickerField(
                    value = formatTime(draft.endTime).orEmpty(),
                    label = stringResource(R.string.meetings_slot_end),
                    onClick = { onPick(SlotPickerField.END) },
                    enabled = enabled,
                    icon = Icons.Outlined.Schedule,
                    errorText = stringResource(R.string.meetings_error_slot_end).takeIf { SlotProblem.END_BEFORE_START in problems },
                    modifier = Modifier.weight(1f),
                )
            }
            FilterChipRow(
                options = MeetingMode.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
                selectedId = draft.mode.name,
                onSelect = { id -> if (enabled) onModeChange(MeetingMode.valueOf(id)) },
            )
            AppTextField(
                value = draft.location,
                onValueChange = onLocationChange,
                label = stringResource(R.string.meetings_location),
                placeholder = stringResource(R.string.meetings_slot_location_hint),
                enabled = enabled,
                errorText = stringResource(R.string.meetings_error_slot_location).takeIf { SlotProblem.LOCATION_TOO_LONG in problems },
            )
        }
    }
}

@Composable
private fun startError(problems: Set<SlotProblem>): String? = when {
    SlotProblem.START_PAST in problems -> stringResource(R.string.meetings_error_slot_start_past)
    SlotProblem.OVERLAP in problems -> stringResource(R.string.meetings_error_slot_overlap)
    else -> null
}

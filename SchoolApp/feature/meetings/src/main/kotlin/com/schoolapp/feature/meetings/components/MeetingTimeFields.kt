package com.schoolapp.feature.meetings.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.domain.MeetingTimeDraft
import com.schoolapp.feature.meetings.domain.MeetingTimeProblem

/** Date, start and end (12-hour pickers), mode chips and optional location of one meeting. */
@Composable
internal fun MeetingTimeFields(
    draft: MeetingTimeDraft,
    problems: Set<MeetingTimeProblem>,
    minDate: String,
    enabled: Boolean,
    onChange: (MeetingTimeDraft) -> Unit,
    modifier: Modifier = Modifier,
) {
    var picking by rememberSaveable { mutableStateOf<String?>(null) }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        PickerField(
            value = formatDate(draft.date).orEmpty(),
            label = stringResource(R.string.meetings_date),
            onClick = { picking = DATE },
            enabled = enabled,
            errorText = stringResource(R.string.meetings_error_slot_date_past).takeIf { MeetingTimeProblem.DATE_PAST in problems },
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            PickerField(
                value = formatTime(draft.startTime).orEmpty(),
                label = stringResource(R.string.meetings_slot_start),
                onClick = { picking = START },
                enabled = enabled,
                icon = Icons.Outlined.Schedule,
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatTime(draft.endTime).orEmpty(),
                label = stringResource(R.string.meetings_slot_end),
                onClick = { picking = END },
                enabled = enabled,
                icon = Icons.Outlined.Schedule,
                errorText = stringResource(R.string.meetings_error_slot_end).takeIf { MeetingTimeProblem.END_BEFORE_START in problems },
                modifier = Modifier.weight(1f),
            )
        }
        FilterChipRow(
            options = MeetingMode.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
            selectedId = draft.mode.name,
            onSelect = { id -> if (enabled) onChange(draft.copy(mode = MeetingMode.valueOf(id))) },
        )
        AppTextField(
            value = draft.location,
            onValueChange = { onChange(draft.copy(location = it)) },
            label = stringResource(R.string.meetings_location),
            placeholder = stringResource(R.string.meetings_slot_location_hint),
            enabled = enabled,
            errorText = stringResource(R.string.meetings_error_slot_location)
                .takeIf { MeetingTimeProblem.LOCATION_TOO_LONG in problems },
        )
    }
    val close = { picking = null }
    when (picking) {
        DATE -> AppDatePickerDialog(
            initialDate = draft.date,
            onConfirm = { onChange(draft.copy(date = it)); close() },
            onDismiss = close,
            minDate = minDate,
        )
        START -> AppTimePickerDialog(
            initialTime = draft.startTime,
            onConfirm = { onChange(draft.withStart(it)); close() },
            onDismiss = close,
            title = stringResource(R.string.meetings_slot_start),
        )
        END -> AppTimePickerDialog(
            initialTime = draft.endTime,
            onConfirm = { onChange(draft.copy(endTime = it)); close() },
            onDismiss = close,
            title = stringResource(R.string.meetings_slot_end),
        )
    }
}

private const val DATE = "date"
private const val START = "start"
private const val END = "end"

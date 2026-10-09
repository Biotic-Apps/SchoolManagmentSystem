package com.schoolapp.feature.meetings.book.components

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
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.book.RequestDraft
import com.schoolapp.feature.meetings.components.labelRes

/** Preferred date, time (12-hour pickers) and mode for a meeting request. */
@Composable
internal fun RequestTimeForm(
    draft: RequestDraft,
    minDate: String,
    enabled: Boolean,
    onDate: (String) -> Unit,
    onTime: (String) -> Unit,
    onMode: (MeetingMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    var picking by rememberSaveable { mutableStateOf<String?>(null) }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            PickerField(
                value = formatDate(draft.date).orEmpty(),
                label = stringResource(R.string.meetings_request_date),
                onClick = { picking = DATE },
                enabled = enabled,
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatTime(draft.startTime).orEmpty(),
                label = stringResource(R.string.meetings_request_time),
                onClick = { picking = TIME },
                enabled = enabled,
                icon = Icons.Outlined.Schedule,
                modifier = Modifier.weight(1f),
            )
        }
        FilterChipRow(
            options = MeetingMode.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
            selectedId = draft.mode.name,
            onSelect = { id -> if (enabled) onMode(MeetingMode.valueOf(id)) },
        )
    }
    val close = { picking = null }
    when (picking) {
        DATE -> AppDatePickerDialog(
            initialDate = draft.date,
            onConfirm = { onDate(it); close() },
            onDismiss = close,
            minDate = minDate,
        )
        TIME -> AppTimePickerDialog(
            initialTime = draft.startTime,
            onConfirm = { onTime(it); close() },
            onDismiss = close,
            title = stringResource(R.string.meetings_request_time),
        )
    }
}

private const val DATE = "date"
private const val TIME = "time"

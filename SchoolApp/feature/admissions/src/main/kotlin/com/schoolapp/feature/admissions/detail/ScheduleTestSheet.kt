package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.TestSchedule
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatTime
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.feature.admissions.R

/** Schedule or reschedule the entrance test; the primary guardian is notified of date, time and venue. */
@Composable
internal fun ScheduleTestSheet(
    test: AdmissionTest?,
    today: String,
    busy: Boolean,
    error: AppError?,
    onSubmit: (TestSchedule) -> Unit,
    onDismiss: () -> Unit,
) {
    val initial = remember(test) { ActionForms.splitSchedule(test) }
    var date by rememberSaveable { mutableStateOf(initial.first) }
    var time by rememberSaveable { mutableStateOf(initial.second) }
    var venue by rememberSaveable { mutableStateOf(test?.venue.orEmpty()) }
    var notes by rememberSaveable { mutableStateOf("") }
    var pickTime by rememberSaveable { mutableStateOf(false) }
    var tried by rememberSaveable { mutableStateOf(false) }
    val title = if (test != null) R.string.admissions_reschedule_test else R.string.admissions_schedule_test
    AppBottomSheet(title = stringResource(title), onDismiss = onDismiss) {
        InlineMessage(stringResource(R.string.admissions_test_notify_hint), StatusTone.Info)
        DateField(
            label = stringResource(R.string.admissions_test_date),
            value = date,
            onPick = { date = it },
            error = if (tried && date.isBlank()) stringResource(R.string.admissions_required) else null,
            minDate = today,
        )
        PickerField(
            value = formatTime(time).orEmpty(),
            label = stringResource(R.string.admissions_test_time),
            onClick = { pickTime = true },
            icon = Icons.Outlined.Schedule,
        )
        AppTextField(venue, { venue = it.take(VENUE_MAX) }, stringResource(R.string.admissions_test_venue),
            placeholder = stringResource(R.string.admissions_test_venue_hint), supportingText = stringResource(R.string.admissions_new_optional))
        AppTextArea(notes, { notes = it.take(NOTES_MAX) }, stringResource(R.string.admissions_test_notes),
            supportingText = stringResource(R.string.admissions_new_optional), minLines = 2)
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(if (test != null) R.string.admissions_reschedule else R.string.admissions_schedule_test),
            onClick = {
                tried = true
                val at = ActionForms.scheduledAt(date, time)
                if (date.isNotBlank() && at != null) onSubmit(TestSchedule(at, venue, notes))
            },
            loading = busy,
            modifier = Modifier.fillMaxWidth(),
        )
    }
    if (pickTime) {
        AppTimePickerDialog(initialTime = time, onConfirm = { time = it; pickTime = false }, onDismiss = { pickTime = false })
    }
}

private const val VENUE_MAX = 150
private const val NOTES_MAX = 1000

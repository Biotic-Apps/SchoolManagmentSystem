package com.schoolapp.feature.timetable.bell

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.timetable.R

/** Fills the selected day's rows: count, start, length, one break after period N. */
@Composable
internal fun GeneratorSheet(form: GeneratorForm, viewModel: BellScheduleViewModel) {
    var pickStart by rememberSaveable { mutableStateOf(false) }
    AppBottomSheet(title = stringResource(R.string.tt_generate), onDismiss = viewModel::dismissGenerator) {
        PickerField(
            value = TimeFormat.formatTime12(form.startTime),
            label = stringResource(R.string.tt_gen_start),
            onClick = { pickStart = true },
            icon = Icons.Outlined.Schedule,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumberField(R.string.tt_gen_count, form.periodsPerDay, Modifier.weight(1f)) { v -> viewModel.updateGenerator { it.copy(periodsPerDay = v) } }
            NumberField(R.string.tt_gen_minutes, form.periodMinutes, Modifier.weight(1f)) { v -> viewModel.updateGenerator { it.copy(periodMinutes = v) } }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumberField(R.string.tt_gen_break_after, form.breakAfter, Modifier.weight(1f)) { v -> viewModel.updateGenerator { it.copy(breakAfter = v) } }
            NumberField(R.string.tt_gen_break_minutes, form.breakMinutes, Modifier.weight(1f), last = true, onDone = viewModel::applyGenerator) { v ->
                viewModel.updateGenerator { it.copy(breakMinutes = v) }
            }
        }
        if (form.invalid) InlineMessage(stringResource(R.string.tt_gen_invalid), StatusTone.Error)
        PrimaryButton(stringResource(R.string.tt_gen_apply), onClick = viewModel::applyGenerator)
    }
    if (pickStart) {
        AppTimePickerDialog(
            initialTime = form.startTime,
            onConfirm = { time ->
                pickStart = false
                viewModel.updateGenerator { it.copy(startTime = time) }
            },
            onDismiss = { pickStart = false },
        )
    }
}

@Composable
private fun NumberField(
    labelRes: Int,
    value: String,
    modifier: Modifier,
    last: Boolean = false,
    onDone: (() -> Unit)? = null,
    onChange: (String) -> Unit,
) {
    AppTextField(
        value = value,
        onValueChange = { onChange(it.filter(Char::isDigit).take(3)) },
        label = stringResource(labelRes),
        kind = FieldKind.Number,
        imeAction = if (last) ImeAction.Done else ImeAction.Next,
        onImeAction = onDone,
        modifier = modifier,
    )
}

package com.schoolapp.feature.pickup.parent

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.pickup.R

@Composable
internal fun EarlyLeaveSheet(
    editor: EarlyLeaveEditor,
    verifiedPersons: List<PickupPerson>,
    onChange: ((EarlyLeaveEditor) -> EarlyLeaveEditor) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    var pickTime by rememberSaveable { mutableStateOf(false) }
    val enabled = !editor.isSaving
    AppBottomSheet(title = stringResource(R.string.pickup_request_early_leave), onDismiss = onDismiss) {
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PickerField(
            value = formatDate(editor.date).orEmpty(),
            label = stringResource(R.string.pickup_leave_date),
            onClick = { pickDate = true },
            enabled = enabled,
            errorText = stringResource(R.string.pickup_leave_past).takeIf { LeaveField.DATE_PAST in editor.errors },
        )
        PickerField(
            value = formatTime(editor.time).orEmpty(),
            label = stringResource(R.string.pickup_leave_time_label),
            onClick = { pickTime = true },
            enabled = enabled,
            icon = Icons.Outlined.Schedule,
            errorText = stringResource(R.string.pickup_required).takeIf { LeaveField.TIME in editor.errors },
        )
        AppTextArea(
            value = editor.reason,
            onValueChange = { v -> onChange { it.copy(reason = v) } },
            label = stringResource(R.string.pickup_leave_reason_label),
            enabled = enabled,
            errorText = stringResource(R.string.pickup_required).takeIf { LeaveField.REASON in editor.errors },
        )
        if (verifiedPersons.isNotEmpty()) {
            SectionHeader(stringResource(R.string.pickup_leave_who))
            FilterChipRow(
                options = listOf(SwitcherOption(NONE, stringResource(R.string.pickup_leave_who_none))) +
                    verifiedPersons.map { SwitcherOption(it.id, it.name, it.relation) },
                selectedId = editor.pickupPersonId ?: NONE,
                onSelect = { id -> onChange { it.copy(pickupPersonId = id.takeUnless { v -> v == NONE }) } },
            )
        }
        PrimaryButton(stringResource(R.string.pickup_submit_leave), onSubmit, loading = editor.isSaving)
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = editor.date,
            onConfirm = { date ->
                pickDate = false
                onChange { it.copy(date = date) }
            },
            onDismiss = { pickDate = false },
        )
    }
    if (pickTime) {
        AppTimePickerDialog(
            initialTime = editor.time,
            title = stringResource(R.string.pickup_leave_time_title),
            onConfirm = { time ->
                pickTime = false
                onChange { it.copy(time = time) }
            },
            onDismiss = { pickTime = false },
        )
    }
}

private const val NONE = "none"

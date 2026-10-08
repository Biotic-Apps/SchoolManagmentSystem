package com.schoolapp.feature.staff.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.OptionPickerField

@Composable
internal fun StatusChangeSheet(
    name: String,
    state: StatusChangeState,
    onStatus: (String) -> Unit,
    onDate: (String) -> Unit,
    onReason: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    val enabled = !state.isSaving
    AppBottomSheet(title = stringResource(R.string.staff_status_title, name), onDismiss = { if (enabled) onDismiss() }) {
        state.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        OptionPickerField(
            label = stringResource(R.string.staff_status_new),
            options = state.options.map { SwitcherOption(it, humanizeKey(it)) },
            selectedId = state.status,
            onSelect = onStatus,
            enabled = enabled,
            errorText = if (state.statusMissing) stringResource(R.string.staff_error_required) else null,
        )
        PickerField(
            value = formatDate(state.effectiveDate).orEmpty(),
            label = stringResource(R.string.staff_status_effective),
            onClick = { pickDate = true },
            enabled = enabled,
        )
        AppTextArea(
            value = state.reason,
            onValueChange = onReason,
            label = stringResource(R.string.staff_status_reason),
            enabled = enabled,
            errorText = if (state.reasonInvalid) stringResource(R.string.staff_status_reason_error) else null,
        )
        if (state.leaving) InlineMessage(stringResource(R.string.staff_status_leaving_warning), StatusTone.Warning)
        PrimaryButton(stringResource(R.string.staff_status_submit), onSubmit, loading = state.isSaving)
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = state.effectiveDate,
            onConfirm = {
                pickDate = false
                onDate(it)
            },
            onDismiss = { pickDate = false },
        )
    }
}

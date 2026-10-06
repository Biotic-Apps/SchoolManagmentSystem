package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.leave.LeaveType
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.leaveTypeLabel

private enum class DateField { FROM, TO }

/** Leave request form; the type chips show only for staff ([LeaveForm.type] not null). */
@Composable
internal fun LeaveRequestSheet(
    form: LeaveForm,
    subtitle: String?,
    onTypeChange: (LeaveType) -> Unit,
    onFromChange: (String) -> Unit,
    onToChange: (String) -> Unit,
    onReasonChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    var picking by rememberSaveable { mutableStateOf<DateField?>(null) }
    AppBottomSheet(title = stringResource(R.string.attendance_leave_request_title), onDismiss = onDismiss) {
        subtitle?.let { SectionHeader(title = it) }
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        form.type?.let { selected ->
            SectionHeader(title = stringResource(R.string.attendance_leave_type))
            FilterChipRow(
                options = LeaveType.entries.map { SwitcherOption(it.name, leaveTypeLabel(it)) },
                selectedId = selected.name,
                onSelect = { onTypeChange(LeaveType.valueOf(it)) },
            )
        }
        PickerField(
            value = formatDate(form.from).orEmpty(),
            label = stringResource(R.string.attendance_leave_from),
            onClick = { picking = DateField.FROM },
            enabled = !form.isSaving,
            errorText = if (form.fromMissing) stringResource(R.string.attendance_leave_date_required) else null,
        )
        PickerField(
            value = formatDate(form.to).orEmpty(),
            label = stringResource(R.string.attendance_leave_to),
            onClick = { picking = DateField.TO },
            enabled = !form.isSaving,
            errorText = when {
                form.toMissing -> stringResource(R.string.attendance_leave_date_required)
                form.rangeInvalid -> stringResource(R.string.attendance_leave_range_invalid)
                else -> null
            },
        )
        AppTextArea(
            value = form.reason,
            onValueChange = onReasonChange,
            label = stringResource(R.string.attendance_leave_reason),
            enabled = !form.isSaving,
            errorText = if (form.reasonMissing) stringResource(R.string.attendance_leave_reason_required) else null,
        )
        PrimaryButton(stringResource(R.string.attendance_leave_send), onSubmit, loading = form.isSaving)
    }
    picking?.let { field ->
        AppDatePickerDialog(
            initialDate = (if (field == DateField.FROM) form.from else form.to).ifBlank { form.from }.ifBlank { null },
            onConfirm = {
                picking = null
                if (field == DateField.FROM) onFromChange(it) else onToChange(it)
            },
            onDismiss = { picking = null },
        )
    }
}

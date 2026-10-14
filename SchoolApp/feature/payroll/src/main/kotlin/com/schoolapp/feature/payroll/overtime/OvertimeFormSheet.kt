package com.schoolapp.feature.payroll.overtime

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.label
import java.time.YearMonth

/** Add extra hours by hand for one staff member on a day of the selected month. */
@Composable
internal fun OvertimeFormSheet(
    form: OvertimeForm,
    month: YearMonth,
    staffOptions: List<PickerOption>,
    onEdit: ((OvertimeForm) -> OvertimeForm) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    var pickDate by remember { mutableStateOf(false) }
    val enabled = !form.isSaving
    AppBottomSheet(title = stringResource(R.string.payroll_ot_form_title), onDismiss = onDismiss) {
        CreatablePickerField(
            label = stringResource(R.string.payroll_extra_staff),
            options = staffOptions,
            selectedId = form.staffId,
            onSelect = { id -> onEdit { it.copy(staffId = id) } },
            enabled = enabled,
            errorText = if (OvertimeFormIssue.STAFF in form.issues) stringResource(R.string.payroll_extra_staff_required) else null,
        )
        PickerField(
            value = formatDate(form.date).orEmpty(),
            label = stringResource(R.string.payroll_ot_date),
            onClick = { pickDate = true },
            enabled = enabled,
            errorText = if (OvertimeFormIssue.DATE in form.issues) stringResource(R.string.payroll_ot_date_invalid, month.label()) else null,
        )
        AppTextField(
            value = form.hours,
            onValueChange = { text -> onEdit { it.copy(hours = text.take(5)) } },
            label = stringResource(R.string.payroll_ot_hours),
            supportingText = stringResource(R.string.payroll_ot_hours_hint),
            errorText = if (OvertimeFormIssue.HOURS in form.issues) stringResource(R.string.payroll_ot_hours_invalid) else null,
            kind = FieldKind.Decimal,
            enabled = enabled,
        )
        AppTextArea(
            value = form.reason,
            onValueChange = { text -> onEdit { it.copy(reason = text.take(OvertimeForm.MAX_REASON)) } },
            label = stringResource(R.string.payroll_extra_reason),
            errorText = if (OvertimeFormIssue.REASON in form.issues) stringResource(R.string.payroll_extra_reason_invalid) else null,
            enabled = enabled,
            minLines = 2,
        )
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextButton(stringResource(R.string.payroll_extra_cancel), onDismiss, enabled = enabled)
            PrimaryButton(stringResource(R.string.payroll_extra_save), onSave, Modifier.weight(1f), loading = form.isSaving)
        }
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = form.date,
            onConfirm = { date -> onEdit { it.copy(date = date) }; pickDate = false },
            onDismiss = { pickDate = false },
            minDate = month.atDay(1).toString(),
            maxDate = month.atEndOfMonth().toString(),
        )
    }
}

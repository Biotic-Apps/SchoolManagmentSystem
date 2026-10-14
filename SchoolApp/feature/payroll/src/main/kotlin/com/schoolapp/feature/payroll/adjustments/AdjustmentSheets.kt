package com.schoolapp.feature.payroll.adjustments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.extras.AdjustmentKind
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.MonthHeader

@Composable
internal fun AdjustmentFormSheet(
    form: AdjustmentForm,
    staffOptions: List<PickerOption>,
    onEdit: ((AdjustmentForm) -> AdjustmentForm) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !form.isSaving
    AppBottomSheet(title = stringResource(R.string.payroll_adj_add), onDismiss = onDismiss) {
        CreatablePickerField(
            label = stringResource(R.string.payroll_extra_staff),
            options = staffOptions,
            selectedId = form.staffId,
            onSelect = { id -> onEdit { it.copy(staffId = id) } },
            enabled = enabled,
            errorText = if (AdjustmentIssue.STAFF in form.issues) stringResource(R.string.payroll_extra_staff_required) else null,
        )
        Text(stringResource(R.string.payroll_adj_month), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        MonthHeader(
            month = form.month,
            canGoNext = true,
            onPrevious = { onEdit { it.copy(month = it.month.minusMonths(1)) } },
            onNext = { onEdit { it.copy(month = it.month.plusMonths(1)) } },
        )
        CreatablePickerField(
            label = stringResource(R.string.payroll_adj_kind),
            options = AdjustmentKind.entries.map { PickerOption(it.name, kindLabel(it), kindHint(it)) },
            selectedId = form.kind?.name,
            onSelect = { id -> onEdit { it.copy(kind = AdjustmentKind.entries.firstOrNull { kind -> kind.name == id }) } },
            enabled = enabled,
            errorText = if (AdjustmentIssue.KIND in form.issues) stringResource(R.string.payroll_adj_kind_required) else null,
        )
        form.kind?.let { Text(kindHint(it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        MoneyField(
            value = form.amount,
            onValueChange = { text -> onEdit { it.copy(amount = text) } },
            label = stringResource(R.string.payroll_adj_amount),
            errorText = if (AdjustmentIssue.AMOUNT in form.issues) stringResource(R.string.payroll_adj_amount_invalid) else null,
            enabled = enabled,
        )
        AppTextArea(
            value = form.reason,
            onValueChange = { text -> onEdit { it.copy(reason = text.take(AdjustmentForm.MAX_REASON)) } },
            label = stringResource(R.string.payroll_extra_reason),
            errorText = if (AdjustmentIssue.REASON in form.issues) stringResource(R.string.payroll_extra_reason_invalid) else null,
            enabled = enabled,
            minLines = 2,
        )
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SheetButtons(stringResource(R.string.payroll_extra_save), form.isSaving, onSave, onDismiss)
    }
}

@Composable
internal fun CancelAdjustmentSheet(cancel: CancelAdjustment, onReason: (String) -> Unit, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    val item = cancel.adjustment
    AppBottomSheet(title = stringResource(R.string.payroll_adj_cancel_title), onDismiss = onDismiss) {
        Text(
            "${item.staffName} · ${kindLabel(item.kind)} · ${MoneyFormat.format(item.amountMinor)}",
            style = MaterialTheme.typography.titleSmall,
            color = AppColors.TextPrimary,
        )
        Text(stringResource(R.string.payroll_adj_cancel_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        AppTextArea(
            value = cancel.reason,
            onValueChange = onReason,
            label = stringResource(R.string.payroll_extra_reason),
            errorText = if (cancel.showIssue) stringResource(R.string.payroll_extra_reason_invalid) else null,
            enabled = !cancel.isSaving,
            minLines = 2,
        )
        cancel.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SheetButtons(stringResource(R.string.payroll_adj_cancel_action), cancel.isSaving, onConfirm, onDismiss, dismissLabel = R.string.payroll_adj_keep)
    }
}

@Composable
private fun SheetButtons(
    confirm: String,
    saving: Boolean,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    dismissLabel: Int = R.string.payroll_extra_cancel,
) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        AppTextButton(stringResource(dismissLabel), onDismiss, enabled = !saving)
        PrimaryButton(confirm, onConfirm, Modifier.weight(1f), loading = saving)
    }
}

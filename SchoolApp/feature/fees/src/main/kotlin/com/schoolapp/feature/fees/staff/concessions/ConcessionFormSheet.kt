package com.schoolapp.feature.fees.staff.concessions

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.ledger.ConcessionType
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.MonthStepper
import com.schoolapp.feature.fees.components.StudentSearch
import com.schoolapp.feature.fees.components.StudentSearchPicker
import com.schoolapp.feature.fees.components.StudentSearchState
import com.schoolapp.feature.fees.staff.structure.SheetFooter

@Composable
internal fun ConcessionFormSheet(
    form: ConcessionForm,
    heads: List<FeeHead>,
    student: StudentSearchState,
    search: StudentSearch,
    onEdit: ((ConcessionForm) -> ConcessionForm) -> Unit,
    onSend: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !form.isSaving
    AppBottomSheet(title = stringResource(R.string.fees_cn_request), onDismiss = onDismiss) {
        StudentSearchPicker(student, search, showRequired = ConcessionIssue.STUDENT in form.issues, enabled = enabled)
        CreatablePickerField(
            label = stringResource(R.string.fees_cn_fee_head),
            options = heads.map { PickerOption(it.id, it.name) },
            selectedId = form.feeHeadId,
            onSelect = { id -> onEdit { it.copy(feeHeadId = id) } },
            noneLabel = stringResource(R.string.fees_cn_all_fees),
            fallbackValue = stringResource(R.string.fees_cn_all_fees),
            enabled = enabled,
        )
        Label(stringResource(R.string.fees_cn_type))
        SegmentedChoice(
            labels = listOf(stringResource(R.string.fees_cn_type_percent), stringResource(R.string.fees_cn_type_fixed)),
            selectedIndex = form.type.ordinal,
            onSelect = { index -> if (enabled) onEdit { it.copy(type = ConcessionType.entries[index]) } },
        )
        val valueIssue = ConcessionIssue.VALUE in form.issues
        if (form.type == ConcessionType.PERCENT) {
            AppTextField(
                value = form.percent,
                onValueChange = { text -> onEdit { it.copy(percent = text.filter(Char::isDigit).take(3)) } },
                label = stringResource(R.string.fees_cn_percent),
                errorText = if (valueIssue) stringResource(R.string.fees_cn_percent_invalid) else null,
                kind = FieldKind.Number,
                enabled = enabled,
            )
        } else {
            MoneyField(
                value = form.amount,
                onValueChange = { text -> onEdit { it.copy(amount = text) } },
                label = stringResource(R.string.fees_cn_amount),
                errorText = if (valueIssue) stringResource(R.string.fees_cn_amount_invalid) else null,
                enabled = enabled,
            )
        }
        Label(stringResource(R.string.fees_cn_first_month))
        MonthStepper(form.from, onChange = { month -> onEdit { it.copy(from = month) } }, enabled = enabled)
        SwitchRow(
            title = stringResource(R.string.fees_cn_set_end),
            checked = form.to != null,
            onCheckedChange = { on -> onEdit { it.copy(to = if (on) it.from.plusMonths(MONTHS_DEFAULT) else null) } },
            supporting = if (form.to == null) stringResource(R.string.fees_cn_open_ended) else null,
            enabled = enabled,
        )
        form.to?.let { to ->
            Label(stringResource(R.string.fees_cn_last_month))
            MonthStepper(to, onChange = { month -> onEdit { it.copy(to = month) } }, enabled = enabled)
            if (ConcessionIssue.TO in form.issues) {
                Text(stringResource(R.string.fees_cn_to_invalid), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
            }
        }
        AppTextArea(
            value = form.reason,
            onValueChange = { text -> onEdit { it.copy(reason = text.take(500)) } },
            label = stringResource(R.string.fees_cn_reason),
            errorText = if (ConcessionIssue.REASON in form.issues) stringResource(R.string.fees_cn_reason_invalid) else null,
            enabled = enabled,
            minLines = 2,
        )
        SheetFooter(form.error, form.isSaving, onSend, onDismiss, saveLabel = stringResource(R.string.fees_cn_send))
    }
}

@Composable
private fun Label(text: String) = Text(text, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)

private const val MONTHS_DEFAULT = 11L

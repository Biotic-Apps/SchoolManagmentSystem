package com.schoolapp.feature.payroll.setup.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.MonthHeader

/** Set / change salary: start month, basic, allowances, deductions, overtime rate and reason. */
@Composable
internal fun SalaryFormCard(
    form: SalaryForm,
    isChange: Boolean,
    isSaving: Boolean,
    saveError: AppError?,
    onEdit: ((SalaryForm) -> SalaryForm) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val enabled = !isSaving
    val issues = form.issues.takeIf { form.showIssues } ?: SalaryFormIssues()
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        SectionHeader(
            title = stringResource(if (isChange) R.string.payroll_setup_form_title_change else R.string.payroll_setup_form_title_set),
            subtitle = stringResource(R.string.payroll_setup_form_help),
        )
        Text(stringResource(R.string.payroll_setup_effective_month), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        MonthHeader(
            month = form.month,
            canGoNext = true,
            onPrevious = { onEdit { it.copy(month = it.month.minusMonths(1)) } },
            onNext = { onEdit { it.copy(month = it.month.plusMonths(1)) } },
        )
        MoneyField(
            value = form.basic,
            onValueChange = { value -> onEdit { it.copy(basic = value) } },
            label = stringResource(R.string.payroll_setup_basic),
            errorText = if (issues.basic) stringResource(R.string.payroll_setup_amount_invalid) else null,
            enabled = enabled,
        )
        SalaryItemsEditor(
            title = stringResource(R.string.payroll_setup_allowances),
            addLabel = stringResource(R.string.payroll_setup_add_allowance),
            rows = form.allowances,
            problems = issues.items,
            enabled = enabled,
            onChange = { rows -> onEdit { it.copy(allowances = rows) } },
            onAdd = { onEdit { it.copy(allowances = it.allowances + ItemRow(it.nextKey), nextKey = it.nextKey + 1) } },
        )
        SalaryItemsEditor(
            title = stringResource(R.string.payroll_setup_deductions),
            addLabel = stringResource(R.string.payroll_setup_add_deduction),
            rows = form.deductions,
            problems = issues.items,
            enabled = enabled,
            onChange = { rows -> onEdit { it.copy(deductions = rows) } },
            onAdd = { onEdit { it.copy(deductions = it.deductions + ItemRow(it.nextKey), nextKey = it.nextKey + 1) } },
        )
        MoneyField(
            value = form.overtimeRate,
            onValueChange = { value -> onEdit { it.copy(overtimeRate = value) } },
            label = stringResource(R.string.payroll_setup_overtime_rate),
            supportingText = stringResource(R.string.payroll_setup_overtime_rate_hint),
            errorText = if (issues.overtime) stringResource(R.string.payroll_setup_amount_invalid) else null,
            enabled = enabled,
        )
        AppTextArea(
            value = form.reason,
            onValueChange = { value -> onEdit { it.copy(reason = value.take(MAX_REASON)) } },
            label = stringResource(R.string.payroll_setup_reason),
            enabled = enabled,
            minLines = 2,
        )
        val input = form.toInput()
        val gross = input.basicMinor + input.allowances.sumOf { it.amountMinor }
        Text(
            stringResource(R.string.payroll_setup_totals, MoneyFormat.format(gross), MoneyFormat.format(gross - input.deductions.sumOf { it.amountMinor })),
            style = MaterialTheme.typography.titleSmall,
            color = AppColors.TextPrimary,
        )
        saveError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextButton(stringResource(R.string.payroll_setup_cancel), onCancel, enabled = enabled)
            PrimaryButton(stringResource(R.string.payroll_setup_save), onSave, Modifier.weight(1f), loading = isSaving)
        }
    }
}

private const val MAX_REASON = 500

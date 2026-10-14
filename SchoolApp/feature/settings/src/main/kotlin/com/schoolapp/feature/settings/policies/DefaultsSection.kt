package com.schoolapp.feature.settings.policies

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ApprovalLimitTypes
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.settings.R

/** Attendance lock time, grading default, diary moderation, late fee and approval limits. */
@Composable
internal fun DefaultsSection(form: PolicyForm, canEdit: Boolean, errors: PolicyErrors, onEdit: ((PolicyForm) -> PolicyForm) -> Unit) {
    var pickTime by rememberSaveable { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(
            title = stringResource(R.string.settings_policies_defaults),
            subtitle = stringResource(R.string.settings_policies_defaults_hint),
        )
        TwoColumns(
            first = { modifier ->
                Column(modifier) {
                    PickerField(
                        value = formatTime(form.attendanceLockTime).orEmpty(),
                        label = stringResource(R.string.settings_policies_lock_time),
                        onClick = { pickTime = true },
                        enabled = canEdit,
                        icon = Icons.Outlined.Schedule,
                        errorText = errors.text(PolicyForm.LOCK_TIME),
                    )
                    Text(
                        stringResource(R.string.settings_policies_lock_time_hint),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                    )
                }
            },
            second = { modifier ->
                AppTextField(
                    value = form.gradingDefault,
                    onValueChange = { value -> if (value.length <= PolicyForm.GRADING_MAX) onEdit { it.copy(gradingDefault = value) } },
                    label = stringResource(R.string.settings_policies_grading),
                    supportingText = stringResource(R.string.settings_policies_grading_hint),
                    errorText = errors.text(PolicyForm.GRADING),
                    enabled = canEdit,
                    modifier = modifier,
                )
            },
        )
        SwitchRow(
            title = stringResource(R.string.settings_policies_diary_moderation),
            supporting = stringResource(R.string.settings_policies_diary_moderation_hint),
            checked = form.diaryModeration,
            onCheckedChange = { on -> onEdit { it.copy(diaryModeration = on) } },
            enabled = canEdit,
        )
        TwoColumns(
            first = { modifier ->
                MoneyField(
                    value = form.lateFeeAmount,
                    onValueChange = { value -> onEdit { it.copy(lateFeeAmount = value) } },
                    label = stringResource(R.string.settings_policies_late_fee),
                    supportingText = stringResource(R.string.settings_policies_late_fee_hint),
                    errorText = errors.text(PolicyForm.LATE_FEE),
                    enabled = canEdit,
                    modifier = modifier,
                )
            },
            second = { modifier ->
                AppTextField(
                    value = form.lateFeeAfterDays,
                    onValueChange = { value -> onEdit { it.copy(lateFeeAfterDays = value.digits()) } },
                    label = stringResource(R.string.settings_policies_late_fee_days),
                    errorText = errors.text(PolicyForm.LATE_FEE_DAYS),
                    enabled = canEdit,
                    kind = FieldKind.Number,
                    modifier = modifier,
                )
            },
        )
        ApprovalLimits(form, canEdit, errors, onEdit)
    }
    if (pickTime) {
        AppTimePickerDialog(
            initialTime = form.attendanceLockTime,
            onConfirm = { time ->
                pickTime = false
                onEdit { it.copy(attendanceLockTime = time) }
            },
            onDismiss = { pickTime = false },
            title = stringResource(R.string.settings_policies_lock_time),
        )
    }
}

@Composable
private fun ApprovalLimits(form: PolicyForm, canEdit: Boolean, errors: PolicyErrors, onEdit: ((PolicyForm) -> PolicyForm) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.settings_policies_limits), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        Text(stringResource(R.string.settings_policies_limits_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        ApprovalLimitTypes.ALL.chunked(2).forEach { pair ->
            TwoColumns(
                first = { modifier -> LimitField(pair[0], form, canEdit, errors, onEdit, modifier) },
                second = { modifier -> pair.getOrNull(1)?.let { LimitField(it, form, canEdit, errors, onEdit, modifier) } },
            )
        }
    }
}

@Composable
private fun LimitField(
    type: String,
    form: PolicyForm,
    canEdit: Boolean,
    errors: PolicyErrors,
    onEdit: ((PolicyForm) -> PolicyForm) -> Unit,
    modifier: androidx.compose.ui.Modifier,
) {
    MoneyField(
        value = form.approvalLimits[type].orEmpty(),
        onValueChange = { value -> onEdit { it.copy(approvalLimits = it.approvalLimits + (type to value)) } },
        label = stringResource(limitLabel(type)),
        errorText = errors.text(PolicyForm.limitKey(type)),
        enabled = canEdit,
        modifier = modifier,
    )
}

private fun limitLabel(type: String): Int = when (type) {
    ApprovalLimitTypes.CONCESSION -> R.string.settings_policies_limit_concession
    ApprovalLimitTypes.REFUND -> R.string.settings_policies_limit_refund
    ApprovalLimitTypes.EXPENSE -> R.string.settings_policies_limit_expense
    else -> R.string.settings_policies_limit_purchase_order
}

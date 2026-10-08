package com.schoolapp.feature.fees.staff.payments.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.FeesChoiceChips
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.staff.payments.ActionIssue
import com.schoolapp.feature.fees.staff.payments.PaymentSheet

/** Refunds are paid back by any counter method, never online (as on the web). */
private val RefundMethods = PaymentMethod.entries.filter { it != PaymentMethod.ONLINE }

@Composable
internal fun ReverseForm(sheet: PaymentSheet, actions: PaymentSheetActions) {
    Text(stringResource(R.string.fees_reverse_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
    ReasonField(sheet, actions)
    FormButtons(sheet, actions)
}

@Composable
internal fun RefundForm(sheet: PaymentSheet, actions: PaymentSheetActions) {
    val enabled = !sheet.isSaving
    Text(stringResource(R.string.fees_refund_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
    MoneyField(
        value = sheet.amount,
        onValueChange = actions.onAmountChange,
        label = stringResource(R.string.fees_refund_amount),
        currency = sheet.payment.currency,
        supportingText = stringResource(R.string.fees_refund_max, MoneyFormat.format(sheet.payment.amountMinor, sheet.payment.currency)),
        errorText = when {
            ActionIssue.AMOUNT_REQUIRED in sheet.issues -> stringResource(R.string.fees_required)
            ActionIssue.AMOUNT_INVALID in sheet.issues -> stringResource(R.string.fees_amount_invalid)
            ActionIssue.AMOUNT_OVER_PAYMENT in sheet.issues -> stringResource(R.string.fees_refund_over_payment)
            else -> null
        },
        enabled = enabled,
    )
    Text(stringResource(R.string.fees_refund_method), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
    FeesChoiceChips(
        options = RefundMethods.map { SwitcherOption(it.name, it.label()) },
        selectedId = sheet.method.name,
        onSelect = { actions.onMethodChange(PaymentMethod.valueOf(it)) },
        enabled = enabled,
    )
    ReasonField(sheet, actions)
    FormButtons(sheet, actions)
}

@Composable
private fun ReasonField(sheet: PaymentSheet, actions: PaymentSheetActions) {
    AppTextArea(
        value = sheet.reason,
        onValueChange = actions.onReasonChange,
        label = stringResource(R.string.fees_action_reason),
        errorText = if (ActionIssue.REASON_TOO_SHORT in sheet.issues) stringResource(R.string.fees_reason_too_short) else null,
        enabled = !sheet.isSaving,
    )
}

@Composable
private fun FormButtons(sheet: PaymentSheet, actions: PaymentSheetActions) {
    PrimaryButton(stringResource(R.string.fees_send_for_approval), actions.onSubmit, Modifier.fillMaxWidth(), loading = sheet.isSaving)
    AppTextButton(stringResource(R.string.fees_back), { actions.onChoose(null) }, enabled = !sheet.isSaving)
}

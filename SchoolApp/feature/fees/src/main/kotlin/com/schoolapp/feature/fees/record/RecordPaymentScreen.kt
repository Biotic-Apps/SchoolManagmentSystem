package com.schoolapp.feature.fees.record

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.FeesChoiceChips
import com.schoolapp.feature.fees.components.FeesDateField
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.record.components.StudentPicker

internal data class RecordPaymentActions(
    val onSearchChange: (String) -> Unit,
    val onStudentSelected: (StudentSummary) -> Unit,
    val onClearStudent: () -> Unit,
    val onAmountChange: (String) -> Unit,
    val onMethodChange: (PaymentMethod) -> Unit,
    val onReferenceChange: (String) -> Unit,
    val onReceivedOnChange: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onRecordAnother: () -> Unit,
    val onDone: () -> Unit,
)

private val CounterMethods = listOf(PaymentMethod.CASH, PaymentMethod.BANK, PaymentMethod.CHEQUE)

@Composable
internal fun RecordPaymentScreen(state: RecordPaymentUiState, actions: RecordPaymentActions, modifier: Modifier = Modifier) {
    ScreenColumn(modifier) {
        val result = state.result
        if (result != null) {
            item(key = "result") { ResultCard(result, actions) }
            return@ScreenColumn
        }
        item(key = "form") { PaymentForm(state, actions) }
    }
}

@Composable
private fun ResultCard(result: RecordResult, actions: RecordPaymentActions) {
    AppCard {
        when (result) {
            RecordResult.Queued -> InlineMessage(stringResource(R.string.fees_payment_queued), StatusTone.Warning)
            is RecordResult.Recorded -> {
                InlineMessage(stringResource(R.string.fees_payment_recorded), StatusTone.Success)
                result.studentName?.let { Text(it, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary) }
                MoneyRow(
                    label = stringResource(R.string.fees_amount_received),
                    amountMinor = result.amountMinor,
                    supporting = result.receiptNo?.let { stringResource(R.string.fees_receipt_no, it) },
                    emphasized = true,
                )
            }
        }
        PrimaryButton(stringResource(R.string.fees_record_another), actions.onRecordAnother, Modifier.fillMaxWidth())
        SecondaryButton(stringResource(R.string.fees_done), actions.onDone, Modifier.fillMaxWidth())
    }
}

@Composable
private fun PaymentForm(state: RecordPaymentUiState, actions: RecordPaymentActions) {
    val issues = state.issues
    val enabled = !state.isSaving
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        StudentPicker(
            selected = state.student,
            search = state.search,
            results = state.results,
            isSearching = state.isSearching,
            searchError = state.searchError,
            showRequired = PaymentIssue.STUDENT_REQUIRED in issues,
            enabled = enabled,
            onSearchChange = actions.onSearchChange,
            onSelect = actions.onStudentSelected,
            onClear = actions.onClearStudent,
        )
        MoneyField(
            value = state.amountText,
            onValueChange = actions.onAmountChange,
            label = stringResource(R.string.fees_amount_received),
            errorText = amountError(issues)?.let { stringResource(it) },
            enabled = enabled,
        )
        Text(stringResource(R.string.fees_method), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        FeesChoiceChips(
            options = CounterMethods.map { SwitcherOption(it.name, it.label()) },
            selectedId = state.method.name,
            onSelect = { actions.onMethodChange(PaymentMethod.valueOf(it)) },
            enabled = enabled,
        )
        val referenceRequired = RecordPaymentValidator.requiresReference(state.method)
        AppTextField(
            value = state.reference,
            onValueChange = actions.onReferenceChange,
            label = stringResource(if (referenceRequired) R.string.fees_reference else R.string.fees_reference_optional),
            supportingText = if (state.method == PaymentMethod.CHEQUE) stringResource(R.string.fees_cheque_help) else null,
            errorText = if (PaymentIssue.REFERENCE_REQUIRED in issues) stringResource(R.string.fees_required) else null,
            enabled = enabled,
        )
        FeesDateField(
            date = state.receivedOn,
            label = stringResource(R.string.fees_received_on),
            maxDate = state.today,
            onDateSelected = actions.onReceivedOnChange,
            modifier = Modifier.fillMaxWidth(),
            errorText = when {
                PaymentIssue.DATE_REQUIRED in issues -> stringResource(R.string.fees_required)
                PaymentIssue.DATE_IN_FUTURE in issues -> stringResource(R.string.fees_date_future)
                else -> null
            },
            enabled = enabled,
        )
        state.error?.let { InlineMessage(recordErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(if (state.pending != null) R.string.fees_retry_save else R.string.fees_save_payment),
            onClick = actions.onSubmit,
            modifier = Modifier.fillMaxWidth(),
            loading = state.isSaving,
        )
    }
}

private fun amountError(issues: Set<PaymentIssue>): Int? = when {
    PaymentIssue.AMOUNT_REQUIRED in issues -> R.string.fees_required
    PaymentIssue.AMOUNT_INVALID in issues -> R.string.fees_amount_invalid
    PaymentIssue.AMOUNT_NOT_POSITIVE in issues -> R.string.fees_amount_positive
    else -> null
}

@Composable
private fun recordErrorMessage(error: AppError): String =
    if (error is AppError.Server && (error.httpCode == HTTP_LOCKED || error.code == DAY_CLOSED)) {
        stringResource(R.string.fees_day_closed)
    } else {
        appErrorMessage(error)
    }

private const val HTTP_LOCKED = 423
private const val DAY_CLOSED = "DAY_CLOSED"

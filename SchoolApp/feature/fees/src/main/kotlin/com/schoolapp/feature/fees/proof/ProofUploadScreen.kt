package com.schoolapp.feature.fees.proof

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.FeesChoiceChips
import com.schoolapp.feature.fees.components.FeesDateField
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.components.periodLabel

internal data class ProofUploadActions(
    val onRetry: () -> Unit,
    val onPickFile: () -> Unit,
    val onRemoveFile: () -> Unit,
    val onAmountChange: (String) -> Unit,
    val onPaidOnChange: (String) -> Unit,
    val onMethodChange: (ProofMethod) -> Unit,
    val onReferenceChange: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDone: () -> Unit,
)

@Composable
internal fun ProofUploadScreen(state: ProofUploadUiState, actions: ProofUploadActions, modifier: Modifier = Modifier) {
    val invoice = state.invoice
    when {
        invoice == null && state.isLoading -> LoadingState(modifier)
        invoice == null -> ErrorState(state.loadError?.let { appErrorMessage(it) }.orEmpty(), modifier, onRetry = actions.onRetry)
        state.submitted -> ScreenColumn(modifier) {
            item(key = "done") {
                AppCard {
                    InlineMessage(stringResource(R.string.fees_proof_sent), StatusTone.Success)
                    PrimaryButton(stringResource(R.string.fees_done), actions.onDone, Modifier.fillMaxWidth())
                }
            }
        }
        else -> ScreenColumn(modifier) {
            item(key = "invoice") {
                AppCard {
                    Text(
                        listOfNotNull(invoice.invoiceNo, periodLabel(invoice.period)).joinToString(" · "),
                        style = MaterialTheme.typography.titleSmall,
                        color = AppColors.TextPrimary,
                    )
                    MoneyRow(stringResource(R.string.fees_balance), invoice.balanceMinor, currency = invoice.currency, emphasized = true)
                }
            }
            item(key = "note") { InlineMessage(stringResource(R.string.fees_proof_note), StatusTone.Info) }
            item(key = "form") { ProofForm(state, invoice.currency, actions) }
        }
    }
}

@Composable
private fun ProofForm(state: ProofUploadUiState, currency: String, actions: ProofUploadActions) {
    val issues = state.issues
    val enabled = !state.isSubmitting
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(stringResource(R.string.fees_proof_file), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        val file = state.file
        if (file == null) {
            SecondaryButton(
                text = stringResource(R.string.fees_pick_file),
                onClick = actions.onPickFile,
                modifier = Modifier.fillMaxWidth(),
                enabled = enabled,
                leadingIcon = Icons.Outlined.AttachFile,
            )
        } else {
            AttachmentChips(
                items = listOf(
                    AttachmentChipItem(file.uri, file.name ?: stringResource(R.string.fees_proof_file), file.mime?.startsWith("image/") == true),
                ),
                onRemove = if (enabled) ({ actions.onRemoveFile() }) else null,
            )
        }
        fileError(issues)?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
        MoneyField(
            value = state.amountText,
            onValueChange = actions.onAmountChange,
            label = stringResource(R.string.fees_amount_paid),
            currency = currency,
            errorText = amountError(issues)?.let { stringResource(it) },
            enabled = enabled,
        )
        FeesDateField(
            date = state.paidOn,
            label = stringResource(R.string.fees_paid_on),
            maxDate = state.today,
            onDateSelected = actions.onPaidOnChange,
            modifier = Modifier.fillMaxWidth(),
            errorText = dateError(issues)?.let { stringResource(it) },
            enabled = enabled,
        )
        Text(stringResource(R.string.fees_method), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        FeesChoiceChips(
            options = ProofMethod.entries.map { SwitcherOption(it.name, it.label()) },
            selectedId = state.method.name,
            onSelect = { id -> actions.onMethodChange(ProofMethod.valueOf(id)) },
            enabled = enabled,
        )
        AppTextField(
            value = state.reference,
            onValueChange = actions.onReferenceChange,
            label = stringResource(R.string.fees_reference),
            supportingText = stringResource(R.string.fees_reference_help),
            errorText = if (ProofIssue.REFERENCE_REQUIRED in issues) stringResource(R.string.fees_required) else null,
            enabled = enabled,
            kind = FieldKind.Code,
            imeAction = ImeAction.Done,
        )
        state.submitError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(stringResource(R.string.fees_send_proof), actions.onSubmit, Modifier.fillMaxWidth(), loading = state.isSubmitting)
    }
}

private fun amountError(issues: Set<ProofIssue>): Int? = when {
    ProofIssue.AMOUNT_REQUIRED in issues -> R.string.fees_required
    ProofIssue.AMOUNT_INVALID in issues -> R.string.fees_amount_invalid
    ProofIssue.AMOUNT_NOT_POSITIVE in issues -> R.string.fees_amount_positive
    ProofIssue.AMOUNT_OVER_BALANCE in issues -> R.string.fees_amount_over_balance
    else -> null
}

private fun dateError(issues: Set<ProofIssue>): Int? = when {
    ProofIssue.DATE_REQUIRED in issues -> R.string.fees_required
    ProofIssue.DATE_IN_FUTURE in issues -> R.string.fees_date_future
    else -> null
}

private fun fileError(issues: Set<ProofIssue>): Int? = when {
    ProofIssue.FILE_REQUIRED in issues -> R.string.fees_file_required
    ProofIssue.FILE_TYPE in issues -> R.string.fees_file_type
    else -> null
}

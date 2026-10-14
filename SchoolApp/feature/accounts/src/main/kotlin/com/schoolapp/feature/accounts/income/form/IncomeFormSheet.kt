package com.schoolapp.feature.accounts.income.form

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.accounts.R

internal class IncomeFormActions(
    val onTitle: (String) -> Unit,
    val onCategory: (String?) -> Unit,
    val onAmount: (String) -> Unit,
    val onDate: (String) -> Unit,
    val onDescription: (String) -> Unit,
    val onNotes: (String) -> Unit,
    val onReceiptPicked: (String) -> Unit,
    val onReceiptRemoved: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

/** "Record income" / "Edit income": donations, rent, event fees and other non-fee income. */
@Composable
internal fun IncomeFormSheet(state: IncomeFormUiState, categories: List<IncomeCategory>, actions: IncomeFormActions) {
    var pickingDate by remember { mutableStateOf(false) }
    val enabled = !state.isSaving
    val title = stringResource(if (state.isEdit) R.string.accounts_edit_income else R.string.accounts_record_income)
    AppBottomSheet(title = title, onDismiss = { if (enabled) actions.onDismiss() }) {
        state.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = state.title,
            onValueChange = { if (it.length <= IncomeFormValidation.MAX_TITLE) actions.onTitle(it) },
            label = stringResource(R.string.accounts_income_name),
            placeholder = stringResource(R.string.accounts_income_name_placeholder),
            kind = FieldKind.Sentence,
            errorText = problemText(state.errors[IncomeField.TITLE], IncomeFormValidation.MIN_TITLE),
            enabled = enabled,
            modifier = Modifier.fillMaxWidth(),
        )
        CreatablePickerField(
            label = stringResource(R.string.accounts_category),
            options = categories.map { PickerOption(it.id, it.name, it.code) },
            selectedId = state.categoryId,
            onSelect = actions.onCategory,
            enabled = enabled,
            errorText = if (state.errors[IncomeField.CATEGORY] != null) stringResource(R.string.accounts_error_choose_category) else null,
            fallbackValue = state.editing?.category?.name,
            modifier = Modifier.fillMaxWidth(),
        )
        if (categories.isEmpty()) InlineMessage(stringResource(R.string.accounts_no_categories_hint), StatusTone.Info)
        MoneyField(
            value = state.amount,
            onValueChange = actions.onAmount,
            label = stringResource(R.string.accounts_amount),
            errorText = when (state.errors[IncomeField.AMOUNT]) {
                null -> null
                IncomeProblem.REQUIRED -> stringResource(R.string.accounts_error_required)
                else -> stringResource(R.string.accounts_error_amount)
            },
            enabled = enabled,
            modifier = Modifier.fillMaxWidth(),
        )
        PickerField(
            value = formatDate(state.receivedOn).orEmpty(),
            label = stringResource(R.string.accounts_received_on),
            onClick = { pickingDate = true },
            errorText = if (state.errors[IncomeField.DATE] != null) stringResource(R.string.accounts_error_required) else null,
            enabled = enabled,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = state.description,
            onValueChange = { if (it.length <= IncomeFormValidation.MAX_DESCRIPTION) actions.onDescription(it) },
            label = stringResource(R.string.accounts_description),
            placeholder = stringResource(R.string.accounts_description_placeholder),
            errorText = problemText(state.errors[IncomeField.DESCRIPTION], 0),
            enabled = enabled,
            modifier = Modifier.fillMaxWidth(),
        )
        ReceiptSection(state, actions, enabled)
        AppTextArea(
            value = state.notes,
            onValueChange = { if (it.length <= IncomeFormValidation.MAX_NOTES) actions.onNotes(it) },
            label = stringResource(R.string.accounts_notes),
            errorText = problemText(state.errors[IncomeField.NOTES], 0),
            enabled = enabled,
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(
            text = stringResource(R.string.accounts_save),
            onClick = actions.onSubmit,
            loading = state.isSaving,
            enabled = !state.receipt.isUploading,
            modifier = Modifier.fillMaxWidth(),
        )
    }
    if (pickingDate) {
        AppDatePickerDialog(
            initialDate = state.receivedOn,
            onConfirm = {
                actions.onDate(it)
                pickingDate = false
            },
            onDismiss = { pickingDate = false },
        )
    }
}

@Composable
private fun ReceiptSection(state: IncomeFormUiState, actions: IncomeFormActions, enabled: Boolean) {
    AttachmentsField(
        draft = state.receipt,
        onPicked = actions.onReceiptPicked,
        onRemove = actions.onReceiptRemoved,
        label = stringResource(R.string.accounts_receipt),
        max = IncomeFormViewModel.MAX_RECEIPTS,
        enabled = enabled,
    )
    val current = state.currentReceiptUrl ?: return
    val external = rememberExternalActions()
    AppTextButton(
        text = stringResource(R.string.accounts_view_current_receipt),
        onClick = { external.open(current) },
        leadingIcon = Icons.Outlined.Receipt,
    )
}

@Composable
private fun problemText(problem: IncomeProblem?, min: Int): String? = when (problem) {
    null -> null
    IncomeProblem.REQUIRED -> stringResource(R.string.accounts_error_required)
    IncomeProblem.TOO_SHORT -> stringResource(R.string.accounts_error_too_short, min)
    IncomeProblem.TOO_LONG -> stringResource(R.string.accounts_error_too_long_plain)
    IncomeProblem.INVALID -> stringResource(R.string.accounts_error_amount)
}

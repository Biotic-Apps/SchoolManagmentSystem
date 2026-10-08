package com.schoolapp.feature.staff.account

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.common.TemporaryPasswordCard
import com.schoolapp.feature.staff.form.OptionPickerField
import com.schoolapp.feature.staff.form.StaffField
import com.schoolapp.feature.staff.form.accountRoleOptions
import com.schoolapp.feature.staff.form.problemText

/** Sheets and dialogs of [StaffAccountViewModel] shown over the staff profile. */
@Composable
internal fun StaffAccountDialogs(name: String, signIn: String?, state: StaffAccountUiState, viewModel: StaffAccountViewModel) {
    state.createForm?.let { form ->
        val enabled = !form.isSaving
        AppBottomSheet(title = stringResource(R.string.staff_account_create_title, name), onDismiss = viewModel::dismissCreate) {
            form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            AppTextField(
                value = form.email,
                onValueChange = { viewModel.onCreateChange(form.copy(email = it)) },
                label = stringResource(R.string.staff_field_email),
                kind = FieldKind.Email,
                enabled = enabled,
                errorText = problemText(form.errors[StaffField.EMAIL]),
                supportingText = stringResource(R.string.staff_contact_hint),
            )
            AppTextField(
                value = form.phone,
                onValueChange = { viewModel.onCreateChange(form.copy(phone = it)) },
                label = stringResource(R.string.staff_field_phone),
                kind = FieldKind.Phone,
                imeAction = ImeAction.Done,
                enabled = enabled,
                errorText = problemText(form.errors[StaffField.PHONE]),
            )
            OptionPickerField(
                label = stringResource(R.string.staff_field_account_role),
                options = accountRoleOptions(),
                selectedId = form.roleKey,
                onSelect = { viewModel.onCreateChange(form.copy(roleKey = it)) },
                enabled = enabled,
            )
            PrimaryButton(stringResource(R.string.staff_account_create), { viewModel.submitCreate(name) }, loading = form.isSaving)
        }
    }
    if (state.confirmReset) {
        ConfirmDialog(
            title = stringResource(R.string.staff_account_reset_title, name),
            message = stringResource(R.string.staff_account_reset_message),
            confirmLabel = stringResource(R.string.staff_account_reset),
            onConfirm = { viewModel.confirmReset(name, signIn) },
            onDismiss = viewModel::cancelReset,
        )
    }
    state.issued?.let { issued ->
        AppBottomSheet(title = stringResource(R.string.staff_temp_password), onDismiss = viewModel::closeIssued) {
            val password = issued.password
            if (password == null) {
                InlineMessage(stringResource(R.string.staff_account_linked), StatusTone.Info)
            } else {
                TemporaryPasswordCard(issued.name, issued.signIn, password)
            }
            PrimaryButton(stringResource(R.string.staff_done), viewModel::closeIssued)
        }
    }
}

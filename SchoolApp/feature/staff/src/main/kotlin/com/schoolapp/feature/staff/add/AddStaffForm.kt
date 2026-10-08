package com.schoolapp.feature.staff.add

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.FormMaxWidth
import com.schoolapp.feature.staff.form.OptionPickerField
import com.schoolapp.feature.staff.form.StaffField
import com.schoolapp.feature.staff.form.StaffForm
import com.schoolapp.feature.staff.form.StaffFormFields
import com.schoolapp.feature.staff.form.accountRoleOptions
import com.schoolapp.feature.staff.form.problemText

@Composable
internal fun AddStaffForm(
    state: AddStaffUiState,
    onFormChange: (StaffForm) -> Unit,
    onBranchChange: (String) -> Unit,
    onCreateAccountChange: (Boolean) -> Unit,
    onRoleChange: (String) -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val enabled = !state.isSaving
    ScreenColumn(modifier, maxWidth = FormMaxWidth) {
        state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        if (state.needsBranchPick) {
            item(key = "branch") {
                OptionPickerField(
                    label = stringResource(R.string.staff_field_branch),
                    options = state.branchOptions,
                    selectedId = state.branchId,
                    onSelect = onBranchChange,
                    enabled = enabled,
                    errorText = problemText(state.errors[StaffField.BRANCH]),
                )
            }
        }
        item(key = "fields") {
            StaffFormFields(
                form = state.form,
                errors = state.errors,
                enabled = enabled,
                onChange = onFormChange,
                contactHint = stringResource(R.string.staff_contact_hint),
            )
        }
        item(key = "account") {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SectionHeader(title = stringResource(R.string.staff_account_section))
                SwitchRow(
                    title = stringResource(R.string.staff_create_account),
                    supporting = stringResource(R.string.staff_create_account_hint),
                    checked = state.createAccount,
                    onCheckedChange = onCreateAccountChange,
                    enabled = enabled,
                )
                if (state.createAccount) {
                    OptionPickerField(
                        label = stringResource(R.string.staff_field_account_role),
                        options = accountRoleOptions(),
                        selectedId = state.roleKey,
                        onSelect = onRoleChange,
                        enabled = enabled,
                    )
                }
            }
        }
        item(key = "submit") { PrimaryButton(stringResource(R.string.staff_add_submit), onSubmit, loading = state.isSaving) }
    }
}

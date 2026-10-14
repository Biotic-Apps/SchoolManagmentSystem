package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.ActionErrorMessage

/** Add / edit branch (details + timings) or, for a principal, timings and working days only. */
@Composable
internal fun BranchFormSheet(form: BranchForm, editor: BranchEditor) {
    val title = when {
        form.isNew -> stringResource(R.string.org_add_branch)
        form.timingsOnly -> stringResource(R.string.org_edit_timings_of, form.branchName)
        else -> stringResource(R.string.org_edit_branch)
    }
    AppBottomSheet(title = title, onDismiss = editor::dismissForm) {
        if (!form.timingsOnly) BranchDetailsFields(form, editor)
        SectionHeader(stringResource(R.string.org_branch_timings))
        BranchTimingsFields(form, editor)
        ActionErrorMessage(form.error)
        PrimaryButton(
            text = stringResource(if (form.isNew) R.string.org_create_branch else R.string.org_save_changes),
            onClick = editor::saveForm,
            loading = form.saving,
        )
    }
}

@Composable
private fun BranchDetailsFields(form: BranchForm, editor: BranchEditor) {
    @Composable
    fun message(field: BranchField): String? = form.errors[field]?.let { stringResource(it) }

    when {
        !form.isNew -> AppTextField(
            value = form.schoolName.orEmpty(), onValueChange = {}, label = stringResource(R.string.org_school), enabled = false,
        )
        form.schools.size > 1 -> CreatablePickerField(
            label = stringResource(R.string.org_school),
            options = form.schools.map { PickerOption(it.id, it.name) },
            selectedId = form.schoolId,
            onSelect = { id -> editor.editForm(BranchField.SCHOOL) { it.copy(schoolId = id) } },
            errorText = message(BranchField.SCHOOL),
        )
        else -> message(BranchField.SCHOOL)?.let { InlineMessage(it, StatusTone.Error) }
    }
    AppTextField(
        value = form.code,
        onValueChange = { v -> editor.editForm(BranchField.CODE) { it.copy(code = v.uppercase().filter(Char::isLetterOrDigit).take(12)) } },
        label = stringResource(R.string.org_branch_code),
        enabled = form.isNew,
        errorText = message(BranchField.CODE),
        supportingText = stringResource(if (form.isNew) R.string.org_branch_code_hint else R.string.org_branch_code_locked),
        kind = FieldKind.Code,
    )
    AppTextField(
        value = form.name,
        onValueChange = { v -> editor.editForm(BranchField.NAME) { it.copy(name = v.take(120)) } },
        label = stringResource(R.string.org_branch_name),
        errorText = message(BranchField.NAME),
        kind = FieldKind.Title,
    )
    AppTextField(
        value = form.phone,
        onValueChange = { v -> editor.editForm(BranchField.PHONE) { it.copy(phone = v.take(20)) } },
        label = stringResource(R.string.org_branch_phone),
        errorText = message(BranchField.PHONE),
        kind = FieldKind.Phone,
    )
    AppTextField(
        value = form.email,
        onValueChange = { v -> editor.editForm(BranchField.EMAIL) { it.copy(email = v.trim()) } },
        label = stringResource(R.string.org_branch_email),
        errorText = message(BranchField.EMAIL),
        kind = FieldKind.Email,
        imeAction = ImeAction.Next,
    )
    AppTextArea(
        value = form.address,
        onValueChange = { v -> editor.editForm(BranchField.ADDRESS) { it.copy(address = v.take(300)) } },
        label = stringResource(R.string.org_branch_address),
        errorText = message(BranchField.ADDRESS),
        minLines = 2,
        maxLines = 4,
    )
}

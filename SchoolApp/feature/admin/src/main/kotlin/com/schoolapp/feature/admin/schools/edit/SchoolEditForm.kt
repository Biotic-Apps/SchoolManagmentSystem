package com.schoolapp.feature.admin.schools.edit

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Save
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.common.fieldProblemText

internal data class SchoolEditActions(
    val onFormChange: (SchoolForm) -> Unit,
    val onLogoPicked: (String) -> Unit,
    val onRemoveLogo: () -> Unit,
    val onSave: () -> Unit,
)

@Composable
internal fun SchoolEditForm(state: SchoolEditUiState, actions: SchoolEditActions, modifier: Modifier = Modifier) {
    val form = state.form
    val change = actions.onFormChange
    @Composable
    fun error(field: SchoolField): String? = state.serverErrors[field] ?: fieldProblemText(state.errors[field])

    ScreenColumn(modifier, maxWidth = AdminFormMaxWidth) {
        item(key = "fields") {
            AppCard(Modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
                AppTextField(
                    value = state.code,
                    onValueChange = {},
                    label = stringResource(R.string.schools_field_code),
                    supportingText = stringResource(R.string.schools_code_fixed),
                    enabled = false,
                    modifier = Modifier.fillMaxWidth(),
                )
                AppTextField(
                    value = form.name,
                    onValueChange = { change(form.copy(name = it)) },
                    label = stringResource(R.string.schools_field_name),
                    errorText = error(SchoolField.NAME),
                    kind = FieldKind.Title,
                    modifier = Modifier.fillMaxWidth(),
                )
                AppTextField(
                    value = form.phone,
                    onValueChange = { change(form.copy(phone = it)) },
                    label = stringResource(R.string.schools_field_phone),
                    errorText = error(SchoolField.PHONE),
                    kind = FieldKind.Phone,
                    modifier = Modifier.fillMaxWidth(),
                )
                AppTextField(
                    value = form.email,
                    onValueChange = { change(form.copy(email = it)) },
                    label = stringResource(R.string.schools_field_email),
                    errorText = error(SchoolField.EMAIL),
                    kind = FieldKind.Email,
                    modifier = Modifier.fillMaxWidth(),
                )
                AppTextField(
                    value = form.website,
                    onValueChange = { change(form.copy(website = it)) },
                    label = stringResource(R.string.schools_field_website),
                    placeholder = "https://",
                    errorText = error(SchoolField.WEBSITE),
                    kind = FieldKind.Uri,
                    imeAction = ImeAction.Next,
                    modifier = Modifier.fillMaxWidth(),
                )
                AppTextArea(
                    value = form.address,
                    onValueChange = { change(form.copy(address = it)) },
                    label = stringResource(R.string.schools_field_address),
                    errorText = error(SchoolField.ADDRESS),
                    minLines = 2,
                    maxLines = 4,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
        item(key = "logo") {
            SchoolLogoField(state.logo, state.form.name, actions.onLogoPicked, actions.onRemoveLogo)
        }
        state.saveError?.let { saveError ->
            item(key = "error") { InlineMessage(actionErrorMessage(saveError), StatusTone.Error) }
        }
        item(key = "save") {
            PrimaryButton(
                text = stringResource(R.string.admin_save_changes),
                onClick = actions.onSave,
                loading = state.isSaving,
                enabled = !state.isSaving && !state.logo.isUploading,
                leadingIcon = Icons.Outlined.Save,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

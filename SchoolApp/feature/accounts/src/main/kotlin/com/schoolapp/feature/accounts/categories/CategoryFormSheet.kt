package com.schoolapp.feature.accounts.categories

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.accounts.R

/** "Add income category": name plus an optional short code (derived from the name when empty). */
@Composable
internal fun CategoryFormSheet(
    form: CategoryFormState,
    onNameChange: (String) -> Unit,
    onCodeChange: (String) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.accounts_add_category), onDismiss = onDismiss) {
        InlineMessage(stringResource(R.string.accounts_category_scope_note), StatusTone.Info)
        form.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = form.name,
            onValueChange = { if (it.length <= CategoryFormState.MAX_NAME) onNameChange(it) },
            label = stringResource(R.string.accounts_category_name),
            placeholder = stringResource(R.string.accounts_category_name_placeholder),
            kind = FieldKind.Title,
            errorText = categoryErrorText(form.nameError),
            enabled = !form.isSaving,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = form.code,
            onValueChange = { if (it.length <= CategoryFormState.MAX_CODE) onCodeChange(it) },
            label = stringResource(R.string.accounts_category_code),
            kind = FieldKind.Code,
            supportingText = stringResource(R.string.accounts_category_code_hint),
            errorText = categoryErrorText(form.codeError),
            enabled = !form.isSaving,
            imeAction = ImeAction.Done,
            onImeAction = onSave,
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(
            text = stringResource(R.string.accounts_add_category),
            onClick = onSave,
            loading = form.isSaving,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun categoryErrorText(error: CategoryError?): String? = when (error) {
    null -> null
    CategoryError.NAME_REQUIRED -> stringResource(R.string.accounts_error_category_name)
    CategoryError.NAME_SHORT -> stringResource(R.string.accounts_error_too_short, CategoryFormState.MIN_NAME)
    CategoryError.NAME_LONG -> stringResource(R.string.accounts_error_too_long, CategoryFormState.MAX_NAME)
    CategoryError.CODE_INVALID -> stringResource(R.string.accounts_error_category_code)
}

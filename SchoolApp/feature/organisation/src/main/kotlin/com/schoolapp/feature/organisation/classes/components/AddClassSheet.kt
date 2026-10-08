package com.schoolapp.feature.organisation.classes.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.classes.AddClassActions
import com.schoolapp.feature.organisation.classes.AddClassForm
import com.schoolapp.feature.organisation.classes.ClassNameProblem
import com.schoolapp.feature.organisation.classes.ClassNameRules

/** Name-only "Add class"; Class setup opens next for sections and subjects. */
@Composable
internal fun AddClassSheet(form: AddClassForm, actions: AddClassActions) {
    AppBottomSheet(title = stringResource(R.string.org_add_class), onDismiss = actions.onDismiss) {
        AppTextField(
            value = form.name,
            onValueChange = actions.onNameChange,
            label = stringResource(R.string.org_class_name),
            placeholder = stringResource(R.string.org_class_name_hint),
            errorText = form.nameError?.let { classNameError(it) },
            supportingText = stringResource(R.string.org_add_class_next),
            kind = FieldKind.Title,
            imeAction = ImeAction.Done,
            onImeAction = actions.onSubmit,
        )
        form.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
        PrimaryButton(stringResource(R.string.org_add_class), onClick = actions.onSubmit, loading = form.saving)
    }
}

@Composable
internal fun classNameError(problem: ClassNameProblem): String = when (problem) {
    ClassNameProblem.REQUIRED -> stringResource(R.string.org_class_name_required)
    ClassNameProblem.TOO_LONG -> stringResource(R.string.org_class_name_too_long, ClassNameRules.MAX_LENGTH)
    ClassNameProblem.DUPLICATE -> stringResource(R.string.org_class_name_taken)
}

package com.schoolapp.feature.organisation.catalogue

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

/** Add or rename a subject / room; rooms also have an optional seat count. */
@Composable
internal fun CatalogueEditorSheet(editor: CatalogueEditor, viewModel: CatalogueViewModel) {
    val room = editor.kind == CatalogueKind.ROOM
    val title = when {
        room && editor.id == null -> R.string.org_add_room
        room -> R.string.org_edit_room
        editor.id == null -> R.string.org_add_subject
        else -> R.string.org_rename_subject
    }
    AppBottomSheet(title = stringResource(title), onDismiss = viewModel::dismissEditor) {
        AppTextField(
            value = editor.name,
            onValueChange = viewModel::onNameChange,
            label = stringResource(if (room) R.string.org_room_name else R.string.org_subject_name),
            errorText = editor.nameError?.let { nameError(it, editor.kind) },
            supportingText = if (!room && editor.id == null) stringResource(R.string.org_subject_code_auto) else null,
            kind = FieldKind.Title,
            imeAction = if (room) ImeAction.Next else ImeAction.Done,
            onImeAction = if (room) null else viewModel::save,
        )
        if (room) {
            AppTextField(
                value = editor.capacity,
                onValueChange = viewModel::onCapacityChange,
                label = stringResource(R.string.org_room_capacity),
                errorText = if (editor.capacityError) stringResource(R.string.org_room_capacity_invalid) else null,
                kind = FieldKind.Number,
                imeAction = ImeAction.Done,
                onImeAction = viewModel::save,
            )
        }
        editor.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
        PrimaryButton(stringResource(R.string.org_save), onClick = viewModel::save, loading = editor.saving)
    }
}

@Composable
private fun nameError(problem: CatalogueProblem, kind: CatalogueKind): String = when (problem) {
    CatalogueProblem.REQUIRED -> stringResource(R.string.org_name_required)
    CatalogueProblem.TOO_SHORT -> stringResource(R.string.org_name_too_short)
    CatalogueProblem.TOO_LONG -> stringResource(R.string.org_name_too_long, CatalogueRules.maxLength(kind))
    CatalogueProblem.DUPLICATE -> stringResource(if (kind == CatalogueKind.ROOM) R.string.org_room_taken else R.string.org_subject_taken)
}

package com.schoolapp.feature.health.card

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.components.AllergyDraftFields
import com.schoolapp.feature.health.components.ContactDraftFields

@Composable
internal fun ChangeRequestSheet(
    editor: ChangeRequestEditor,
    onInstructionsChange: (String) -> Unit,
    onAllergyChange: (AllergyDraft) -> Unit,
    onAddAllergy: () -> Unit,
    onRemoveAllergy: (Long) -> Unit,
    onContactChange: (ContactDraft) -> Unit,
    onAddContact: () -> Unit,
    onRemoveContact: (Long) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !editor.isSaving
    AppBottomSheet(title = stringResource(R.string.health_change_title), onDismiss = onDismiss) {
        InlineMessage(stringResource(R.string.health_change_hint), StatusTone.Info)
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(
            value = editor.instructions,
            onValueChange = onInstructionsChange,
            label = stringResource(R.string.health_instructions),
            enabled = enabled,
        )
        SectionHeader(stringResource(R.string.health_allergies))
        editor.allergies.forEach { draft ->
            AllergyDraftFields(
                draft = draft,
                showErrors = editor.showErrors,
                enabled = enabled,
                onChange = onAllergyChange,
                onRemove = { onRemoveAllergy(draft.key) },
            )
        }
        AppTextButton(stringResource(R.string.health_add_allergy), onAddAllergy, enabled = enabled, leadingIcon = Icons.Outlined.Add)
        SectionHeader(stringResource(R.string.health_emergency_contacts), subtitle = stringResource(R.string.health_emergency_contacts_subtitle))
        editor.contacts.forEachIndexed { index, draft ->
            ContactDraftFields(
                number = index + 1,
                draft = draft,
                showErrors = editor.showErrors,
                enabled = enabled,
                onChange = onContactChange,
                onRemove = { onRemoveContact(draft.key) },
            )
        }
        AppTextButton(stringResource(R.string.health_add_contact), onAddContact, enabled = enabled, leadingIcon = Icons.Outlined.Add)
        PrimaryButton(stringResource(R.string.health_send), onSubmit, loading = editor.isSaving)
    }
}

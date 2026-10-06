package com.schoolapp.feature.pickup.parent

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddAPhoto
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.pickup.R

@Composable
internal fun AddPersonSheet(
    editor: AddPersonEditor,
    onChange: ((AddPersonEditor) -> AddPersonEditor) -> Unit,
    onPickPhoto: () -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !editor.isSaving
    val required = stringResource(R.string.pickup_required)
    AppBottomSheet(title = stringResource(R.string.pickup_add_person), onDismiss = onDismiss) {
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        Row(verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(name = editor.name.ifBlank { "?" }, photoUrl = editor.photoUrl, size = 56.dp)
            Spacer(Modifier.width(12.dp))
            if (editor.photoUploading) {
                Text(stringResource(R.string.pickup_photo_uploading), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            } else {
                SecondaryButton(
                    text = stringResource(if (editor.photoFileId == null) R.string.pickup_add_photo else R.string.pickup_change_photo),
                    onClick = onPickPhoto,
                    enabled = enabled,
                    leadingIcon = Icons.Outlined.AddAPhoto,
                )
            }
        }
        AppTextField(
            value = editor.name,
            onValueChange = { v -> onChange { it.copy(name = v) } },
            label = stringResource(R.string.pickup_person_name),
            enabled = enabled,
            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words),
            errorText = required.takeIf { PersonField.NAME in editor.errors },
        )
        AppTextField(
            value = editor.relation,
            onValueChange = { v -> onChange { it.copy(relation = v) } },
            label = stringResource(R.string.pickup_person_relation),
            enabled = enabled,
            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words),
            errorText = required.takeIf { PersonField.RELATION in editor.errors },
        )
        AppTextField(
            value = editor.phone,
            onValueChange = { v -> onChange { it.copy(phone = v) } },
            label = stringResource(R.string.pickup_person_phone),
            enabled = enabled,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            errorText = when {
                PersonField.PHONE in editor.errors -> required
                PersonField.PHONE_FORMAT in editor.errors -> stringResource(R.string.pickup_phone_invalid)
                else -> null
            },
        )
        AppTextField(
            value = editor.cnic,
            onValueChange = { v -> onChange { it.copy(cnic = v) } },
            label = stringResource(R.string.pickup_person_cnic),
            enabled = enabled,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            errorText = stringResource(R.string.pickup_cnic_invalid).takeIf { PersonField.CNIC_FORMAT in editor.errors },
        )
        PrimaryButton(
            text = stringResource(R.string.pickup_submit_person),
            onClick = onSubmit,
            enabled = !editor.photoUploading,
            loading = editor.isSaving,
        )
    }
}

package com.schoolapp.feature.profile.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.profile.ProfileUiState
import com.schoolapp.feature.profile.R

@Composable
internal fun ProfileForm(
    state: ProfileUiState,
    onNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onPhoneChange: (String) -> Unit,
    onSave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.profile_details_title))
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            state.saveError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            if (state.saved) InlineMessage(stringResource(R.string.profile_saved), StatusTone.Success)
            AppTextField(
                value = state.form.name,
                onValueChange = onNameChange,
                label = stringResource(R.string.profile_name),
                errorText = state.nameError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSaving,
                kind = FieldKind.Name,
            )
            AppTextField(
                value = state.form.email,
                onValueChange = onEmailChange,
                label = stringResource(R.string.profile_email),
                errorText = state.emailError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSaving,
                kind = FieldKind.Email,
            )
            AppTextField(
                value = state.form.phone,
                onValueChange = onPhoneChange,
                label = stringResource(R.string.profile_phone),
                errorText = state.phoneError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSaving,
                kind = FieldKind.Phone,
                imeAction = ImeAction.Done,
                onImeAction = { if (state.hasChanges) onSave() },
            )
            PrimaryButton(
                text = stringResource(R.string.profile_save),
                onClick = onSave,
                enabled = state.hasChanges,
                loading = state.isSaving,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

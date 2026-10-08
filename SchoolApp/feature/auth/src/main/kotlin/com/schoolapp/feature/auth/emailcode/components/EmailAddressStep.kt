package com.schoolapp.feature.auth.emailcode.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.emailcode.EmailSignInActions
import com.schoolapp.feature.auth.emailcode.EmailSignInUiState

@Composable
internal fun EmailAddressStep(state: EmailSignInUiState, actions: EmailSignInActions, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        AppTextField(
            value = state.email,
            onValueChange = actions.onEmailChange,
            label = stringResource(R.string.auth_email_code_address_label),
            errorText = state.emailError?.let { stringResource(it.messageRes()) },
            supportingText = stringResource(R.string.auth_email_code_address_hint),
            enabled = !state.isSubmitting,
            kind = FieldKind.Username,
            imeAction = ImeAction.Done,
            onImeAction = actions.onSendCode,
        )
        PrimaryButton(
            text = stringResource(R.string.auth_email_code_send),
            onClick = actions.onSendCode,
            loading = state.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextButton(
            text = stringResource(R.string.auth_email_code_use_password),
            onClick = actions.onUsePassword,
            enabled = !state.isSubmitting,
            contentColor = AppColors.TextSecondary,
            modifier = Modifier.align(Alignment.CenterHorizontally),
        )
    }
}

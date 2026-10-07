package com.schoolapp.feature.auth.phone.components

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
import com.schoolapp.feature.auth.phone.PhoneSignInActions
import com.schoolapp.feature.auth.phone.PhoneSignInUiState

@Composable
internal fun PhoneNumberStep(state: PhoneSignInUiState, actions: PhoneSignInActions, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        AppTextField(
            value = state.phone,
            onValueChange = actions.onPhoneChange,
            label = stringResource(R.string.auth_phone_label),
            errorText = state.phoneError?.let { stringResource(it.messageRes()) },
            supportingText = stringResource(R.string.auth_phone_hint),
            enabled = !state.isSubmitting,
            kind = FieldKind.Phone,
            imeAction = ImeAction.Done,
            onImeAction = actions.onSendCode,
        )
        PrimaryButton(
            text = stringResource(R.string.auth_phone_send),
            onClick = actions.onSendCode,
            loading = state.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextButton(
            text = stringResource(R.string.auth_phone_use_password),
            onClick = actions.onUsePassword,
            enabled = !state.isSubmitting,
            contentColor = AppColors.TextSecondary,
            modifier = Modifier.align(Alignment.CenterHorizontally),
        )
    }
}

package com.schoolapp.feature.auth.phone.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
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
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Send),
            keyboardActions = KeyboardActions(onSend = { actions.onSendCode() }),
            modifier = Modifier.semantics { contentType = ContentType.PhoneNumber },
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

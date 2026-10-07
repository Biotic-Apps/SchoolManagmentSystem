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

private const val SECONDS_PER_MINUTE = 60

@Composable
internal fun PhoneCodeStep(state: PhoneSignInUiState, actions: PhoneSignInActions, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        AppTextField(
            value = state.code,
            onValueChange = actions.onCodeChange,
            label = stringResource(R.string.auth_phone_code_label),
            errorText = state.codeError?.let { stringResource(it.messageRes()) },
            enabled = !state.isSubmitting,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { actions.onVerify() }),
            modifier = Modifier.semantics { contentType = ContentType.SmsOtpCode },
        )
        PrimaryButton(
            text = stringResource(R.string.auth_phone_verify),
            onClick = actions.onVerify,
            loading = state.isSubmitting,
            modifier = Modifier.fillMaxWidth(),
        )
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            val waiting = state.resendInSeconds > 0
            AppTextButton(
                text = if (waiting) {
                    stringResource(
                        R.string.auth_phone_resend_in,
                        state.resendInSeconds / SECONDS_PER_MINUTE,
                        state.resendInSeconds % SECONDS_PER_MINUTE,
                    )
                } else {
                    stringResource(R.string.auth_phone_resend)
                },
                onClick = actions.onResend,
                enabled = !waiting && !state.isSubmitting,
            )
            AppTextButton(
                text = stringResource(R.string.auth_phone_change_number),
                onClick = actions.onChangeNumber,
                enabled = !state.isSubmitting,
                contentColor = AppColors.TextSecondary,
            )
        }
    }
}

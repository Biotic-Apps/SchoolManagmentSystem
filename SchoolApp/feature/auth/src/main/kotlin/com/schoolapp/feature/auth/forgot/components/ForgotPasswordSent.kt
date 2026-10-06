package com.schoolapp.feature.auth.forgot.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.auth.R

@Composable
internal fun ForgotPasswordSent(
    onHaveResetCode: () -> Unit,
    onBackToSignIn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        InlineMessage(text = stringResource(R.string.auth_forgot_sent), tone = StatusTone.Success)
        PrimaryButton(
            text = stringResource(R.string.auth_have_reset_code),
            onClick = onHaveResetCode,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextButton(
            text = stringResource(R.string.auth_back_to_sign_in),
            onClick = onBackToSignIn,
            modifier = Modifier.align(Alignment.CenterHorizontally),
        )
    }
}

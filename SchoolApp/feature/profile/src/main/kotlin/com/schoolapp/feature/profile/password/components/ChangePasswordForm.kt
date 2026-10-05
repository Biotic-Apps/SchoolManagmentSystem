package com.schoolapp.feature.profile.password.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.components.messageRes
import com.schoolapp.feature.profile.password.ChangePasswordUiState

@Composable
internal fun ChangePasswordForm(
    state: ChangePasswordUiState,
    forced: Boolean,
    onCurrentChange: (String) -> Unit,
    onNewChange: (String) -> Unit,
    onConfirmChange: (String) -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            InlineMessage(
                text = stringResource(if (forced) R.string.password_forced_message else R.string.password_rules),
                tone = if (forced) StatusTone.Warning else StatusTone.Info,
            )
            state.failure?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            PasswordField(
                value = state.current,
                onValueChange = onCurrentChange,
                label = stringResource(R.string.password_current),
                errorText = state.currentError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSubmitting,
                imeAction = ImeAction.Next,
            )
            PasswordField(
                value = state.new,
                onValueChange = onNewChange,
                label = stringResource(R.string.password_new),
                errorText = state.newError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSubmitting,
                imeAction = ImeAction.Next,
            )
            PasswordField(
                value = state.confirm,
                onValueChange = onConfirmChange,
                label = stringResource(R.string.password_confirm),
                errorText = state.confirmError?.let { stringResource(it.messageRes()) },
                enabled = !state.isSubmitting,
                onImeAction = onSubmit,
            )
            PrimaryButton(
                text = stringResource(R.string.password_submit),
                onClick = onSubmit,
                loading = state.isSubmitting,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

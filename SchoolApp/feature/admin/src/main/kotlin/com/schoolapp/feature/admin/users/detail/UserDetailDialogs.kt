package com.schoolapp.feature.admin.users.detail

import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.window.DialogProperties
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.TemporaryPasswordCard
import com.schoolapp.feature.admin.users.components.roleKeyLabel

/** Confirm dialogs of the detail screen and the one-time password after a reset. */
@Composable
internal fun UserDetailDialogs(state: UserDetailUiState, onConfirm: () -> Unit, onDismiss: () -> Unit, onPasswordDone: () -> Unit) {
    val user = state.detail?.user ?: return
    when (val confirm = state.confirm) {
        null -> Unit
        UserConfirm.ToggleStatus -> {
            val disabling = user.isActive
            ConfirmDialog(
                title = stringResource(if (disabling) R.string.users_disable_title else R.string.users_enable_title, user.name),
                message = stringResource(if (disabling) R.string.users_disable_message else R.string.users_enable_message),
                confirmLabel = stringResource(if (disabling) R.string.users_disable else R.string.users_enable),
                onConfirm = onConfirm,
                onDismiss = onDismiss,
                destructive = disabling,
            )
        }
        UserConfirm.ResetPassword -> ConfirmDialog(
            title = stringResource(R.string.users_reset_title, user.name),
            message = stringResource(R.string.users_reset_message),
            confirmLabel = stringResource(R.string.users_reset_password),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            destructive = true,
        )
        UserConfirm.Unlock -> ConfirmDialog(
            title = stringResource(R.string.users_unlock_title, user.name),
            message = stringResource(R.string.users_unlock_message),
            confirmLabel = stringResource(R.string.users_unlock),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
        )
        is UserConfirm.EndAssignment -> ConfirmDialog(
            title = stringResource(
                R.string.users_end_title,
                confirm.assignment.roleName ?: roleKeyLabel(confirm.assignment.roleKey),
            ),
            message = stringResource(R.string.users_end_message),
            confirmLabel = stringResource(R.string.users_end_assignment),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            destructive = true,
        )
    }
    state.revealedPassword?.let { password ->
        // Must be acknowledged: the password is never shown again.
        AlertDialog(
            onDismissRequest = {},
            properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false),
            containerColor = AppColors.Surface,
            text = {
                TemporaryPasswordCard(
                    name = user.name,
                    signIn = user.email ?: user.phone,
                    password = password,
                    title = stringResource(R.string.users_new_password_title, user.name),
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                )
            },
            confirmButton = { AppTextButton(stringResource(R.string.users_done), onPasswordDone) },
        )
    }
}

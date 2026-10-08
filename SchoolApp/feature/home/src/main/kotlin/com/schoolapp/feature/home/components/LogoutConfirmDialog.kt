package com.schoolapp.feature.home.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.feature.home.R

/** Shared by the top bar and the More sheet. */
@Composable
internal fun LogoutConfirmDialog(onConfirm: () -> Unit, onDismiss: () -> Unit) {
    ConfirmDialog(
        title = stringResource(R.string.home_logout_title),
        message = stringResource(R.string.home_logout_message),
        confirmLabel = stringResource(R.string.home_logout),
        onConfirm = onConfirm,
        onDismiss = onDismiss,
        destructive = true,
    )
}

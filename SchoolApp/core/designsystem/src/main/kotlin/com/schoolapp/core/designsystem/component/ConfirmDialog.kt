package com.schoolapp.core.designsystem.component

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun ConfirmDialog(
    title: String,
    message: String,
    confirmLabel: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    dismissLabel: String = stringResource(R.string.ds_cancel),
    destructive: Boolean = false,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier,
        containerColor = AppColors.Surface,
        shape = MaterialTheme.shapes.medium,
        title = { Text(title, style = MaterialTheme.typography.titleLarge) },
        text = { Text(message, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextSecondary) },
        confirmButton = {
            AppTextButton(
                text = confirmLabel,
                onClick = onConfirm,
                contentColor = if (destructive) AppColors.Error else AppColors.Primary,
            )
        },
        dismissButton = {
            AppTextButton(text = dismissLabel, onClick = onDismiss, contentColor = AppColors.TextSecondary)
        },
    )
}

@Preview
@Composable
private fun ConfirmDialogPreview() = PreviewContainer {
    ConfirmDialog(
        title = "Sign out?",
        message = "Unsynced drafts on this device will be removed.",
        confirmLabel = "Sign out",
        onConfirm = {},
        onDismiss = {},
        destructive = true,
    )
}

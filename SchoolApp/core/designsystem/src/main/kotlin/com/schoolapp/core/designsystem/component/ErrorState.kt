package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R

@Composable
fun ErrorState(
    message: String,
    modifier: Modifier = Modifier,
    title: String = stringResource(R.string.ds_error_title),
    onRetry: (() -> Unit)? = null,
) {
    EmptyState(
        title = title,
        message = message,
        icon = Icons.Outlined.ErrorOutline,
        modifier = modifier,
        action = onRetry?.let { retry ->
            { SecondaryButton(text = stringResource(R.string.ds_retry), onClick = retry) }
        },
    )
}

@Preview
@Composable
private fun ErrorStatePreview() = PreviewContainer {
    ErrorState(message = "Check your connection and try again.", onRetry = {})
}

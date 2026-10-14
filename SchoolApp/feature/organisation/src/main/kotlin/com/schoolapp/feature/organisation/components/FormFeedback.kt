package com.schoolapp.feature.organisation.components

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import kotlinx.coroutines.delay

/** A failed save, shown inside the form that caused it. */
@Composable
internal fun ActionErrorMessage(error: ActionError?, modifier: Modifier = Modifier) {
    if (error == null) return
    InlineMessage(actionErrorMessage(error.error, error.details), StatusTone.Error, modifier)
}

/** "Branch updated" style confirmation that clears itself after a few seconds. */
@Composable
internal fun SuccessNotice(@StringRes message: Int?, onShown: () -> Unit, modifier: Modifier = Modifier) {
    if (message == null) return
    LaunchedEffect(message) {
        delay(NOTICE_MILLIS)
        onShown()
    }
    InlineMessage(stringResource(message), StatusTone.Success, modifier)
}

private const val NOTICE_MILLIS = 3_500L

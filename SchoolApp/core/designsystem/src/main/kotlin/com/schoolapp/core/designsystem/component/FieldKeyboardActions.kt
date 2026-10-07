package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController

/**
 * Next moves focus to the field below (or runs [onImeAction] if given). Done, Go and Search run
 * [onImeAction], then hide the keyboard and clear focus. Send runs [onImeAction] and keeps the keyboard up.
 */
@Composable
fun rememberFieldKeyboardActions(onImeAction: (() -> Unit)?): KeyboardActions {
    val focusManager = LocalFocusManager.current
    val keyboard = LocalSoftwareKeyboardController.current
    val action by rememberUpdatedState(onImeAction)
    return remember(focusManager, keyboard) {
        val finish: () -> Unit = {
            action?.invoke()
            keyboard?.hide()
            focusManager.clearFocus()
        }
        KeyboardActions(
            onNext = { action?.invoke() ?: focusManager.moveFocus(FocusDirection.Down) },
            onPrevious = { focusManager.moveFocus(FocusDirection.Up) },
            onDone = { finish() },
            onGo = { finish() },
            onSearch = { finish() },
            onSend = { action?.invoke() },
        )
    }
}

package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusEvent
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val KEYBOARD_SETTLE_MS = 350L

/**
 * When this field gains focus, scrolls [target] (attach it to the form's primary button with
 * `Modifier.bringIntoViewRequester`) into view after the keyboard has opened, so the button is not hidden.
 */
@Composable
fun Modifier.revealOnFocus(target: BringIntoViewRequester): Modifier {
    val scope = rememberCoroutineScope()
    return onFocusEvent { state ->
        if (state.isFocused) {
            scope.launch {
                delay(KEYBOARD_SETTLE_MS)
                target.bringIntoView()
            }
        }
    }
}

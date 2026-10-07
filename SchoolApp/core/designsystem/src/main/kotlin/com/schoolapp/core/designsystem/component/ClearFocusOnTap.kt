package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController

/** A tap on empty space (not consumed by a child) clears focus and hides the keyboard. */
@Composable
fun Modifier.clearFocusOnTap(): Modifier {
    val focusManager = LocalFocusManager.current
    val keyboard = LocalSoftwareKeyboardController.current
    return pointerInput(focusManager, keyboard) {
        detectTapGestures {
            keyboard?.hide()
            focusManager.clearFocus()
        }
    }
}

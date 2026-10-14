package com.schoolapp.feature.accounts.common

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect

/** Shows [message] once in [snackbar], then lets the ViewModel clear it via [onShown]. */
@Composable
internal fun SnackbarNotice(message: String?, snackbar: SnackbarHostState, onShown: () -> Unit) {
    LaunchedEffect(message) {
        if (message != null) {
            onShown()
            snackbar.showSnackbar(message)
        }
    }
}

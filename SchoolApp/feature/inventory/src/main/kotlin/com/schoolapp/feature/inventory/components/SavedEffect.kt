package com.schoolapp.feature.inventory.components

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.coroutineScope

/**
 * Collects one-off "saved" messages while the screen is shown: runs [onSaved] (reload) and shows the
 * text in [snackbar]. [saved] must be a stable flow (remember a merged one).
 */
@Composable
internal fun SavedEffect(saved: Flow<SavedMessage>, snackbar: SnackbarHostState, onSaved: (SavedMessage) -> Unit) {
    val context = LocalContext.current
    val latest = rememberUpdatedState(onSaved)
    LaunchedEffect(saved) {
        coroutineScope {
            saved.collect { message ->
                latest.value(message)
                val text = message.arg?.let { context.getString(message.res, it) } ?: context.getString(message.res)
                launch { snackbar.showSnackbar(text) }
            }
        }
    }
}

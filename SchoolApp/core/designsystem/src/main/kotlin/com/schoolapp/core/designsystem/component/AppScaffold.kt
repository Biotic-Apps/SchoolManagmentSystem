package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScaffoldDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors

/**
 * Content insets include the keyboard, so screens without a bottom bar shrink above it; the padding handed to
 * [content] is marked consumed, so an extra imePadding() inside does not double up. Tapping empty space clears
 * focus and hides the keyboard.
 */
@Composable
fun AppScaffold(
    modifier: Modifier = Modifier,
    topBar: @Composable () -> Unit = {},
    bottomBar: @Composable () -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    snackbarHostState: SnackbarHostState? = null,
    contentWindowInsets: WindowInsets = ScaffoldDefaults.contentWindowInsets.union(WindowInsets.ime),
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        modifier = modifier.clearFocusOnTap(),
        topBar = topBar,
        bottomBar = bottomBar,
        floatingActionButton = floatingActionButton,
        snackbarHost = { snackbarHostState?.let { SnackbarHost(it) } },
        containerColor = AppColors.Background,
        contentColor = AppColors.TextPrimary,
        contentWindowInsets = contentWindowInsets,
    ) { padding ->
        Box(Modifier.consumeWindowInsets(padding)) { content(padding) }
    }
}

@Preview
@Composable
private fun AppScaffoldPreview() = PreviewContainer {
    val snackbar = remember { SnackbarHostState() }
    AppScaffold(
        topBar = { AppTopBar(title = "Dashboard") },
        snackbarHostState = snackbar,
    ) { padding ->
        Text("Content", modifier = Modifier.padding(padding))
    }
}

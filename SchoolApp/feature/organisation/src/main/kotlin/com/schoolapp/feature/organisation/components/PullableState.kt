package com.schoolapp.feature.organisation.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** Makes a non-list state (empty/error) scrollable so pull-to-refresh still reaches it. */
@Composable
internal fun PullableState(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(modifier.fillMaxSize().verticalScroll(rememberScrollState())) { content() }
}

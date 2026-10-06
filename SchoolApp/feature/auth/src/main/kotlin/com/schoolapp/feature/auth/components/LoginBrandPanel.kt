package com.schoolapp.feature.auth.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.branding.LoginBrandUiState

/** Left pane on expanded widths. */
@Composable
internal fun LoginBrandPanel(brand: LoginBrandUiState, modifier: Modifier = Modifier) {
    Box(modifier.background(AppColors.Selected).padding(32.dp), contentAlignment = Alignment.Center) {
        LoginHeader(brand, Modifier.widthIn(max = 360.dp))
    }
}

@Preview(widthDp = 480, heightDp = 640)
@Composable
private fun LoginBrandPanelPreview() = SchoolTheme { LoginBrandPanel(LoginBrandUiState(), Modifier.fillMaxSize()) }

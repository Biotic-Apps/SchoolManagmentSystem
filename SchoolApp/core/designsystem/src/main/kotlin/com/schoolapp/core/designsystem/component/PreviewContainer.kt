package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme

@Composable
internal fun PreviewContainer(content: @Composable () -> Unit) {
    SchoolTheme {
        Box(Modifier.background(AppColors.Background).padding(16.dp)) { content() }
    }
}

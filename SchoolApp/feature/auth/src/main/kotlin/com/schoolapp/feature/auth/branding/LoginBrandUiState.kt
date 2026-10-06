package com.schoolapp.feature.auth.branding

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import com.schoolapp.core.designsystem.theme.AppColors

/** [name] is null until the school's branding is known; the screen then shows the default app name. */
@Immutable
data class LoginBrandUiState(
    val name: String? = null,
    val logoUrl: String? = null,
    val color: Color = AppColors.Primary,
)

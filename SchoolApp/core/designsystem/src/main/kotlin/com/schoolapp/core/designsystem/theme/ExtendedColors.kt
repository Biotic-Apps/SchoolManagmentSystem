package com.schoolapp.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

@Immutable
data class StatusColors(val content: Color, val container: Color)

@Immutable
data class ExtendedColors(
    val selected: Color,
    val textSecondary: Color,
    val border: Color,
    val success: StatusColors,
    val warning: StatusColors,
    val error: StatusColors,
    val info: StatusColors,
)

internal val AppExtendedColors = ExtendedColors(
    selected = AppColors.Selected,
    textSecondary = AppColors.TextSecondary,
    border = AppColors.Border,
    success = StatusColors(AppColors.Success, AppColors.SuccessContainer),
    warning = StatusColors(AppColors.Warning, AppColors.WarningContainer),
    error = StatusColors(AppColors.Error, AppColors.ErrorContainer),
    info = StatusColors(AppColors.Info, AppColors.InfoContainer),
)

val LocalExtendedColors = staticCompositionLocalOf { AppExtendedColors }

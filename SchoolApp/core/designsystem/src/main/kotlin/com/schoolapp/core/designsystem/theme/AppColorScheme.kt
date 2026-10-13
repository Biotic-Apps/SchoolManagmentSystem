package com.schoolapp.core.designsystem.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

internal val AppColorScheme: ColorScheme = lightColorScheme(
    primary = AppColors.Primary,
    onPrimary = AppColors.OnPrimary,
    primaryContainer = AppColors.Selected,
    onPrimaryContainer = AppColors.OnSelected,
    secondary = Color(0xFF9333EA),
    onSecondary = AppColors.OnPrimary,
    secondaryContainer = Color(0xFFF3E8FF),
    onSecondaryContainer = Color(0xFF3B1F8C),
    tertiary = Color(0xFFF472B6),
    onTertiary = AppColors.OnPrimary,
    tertiaryContainer = Color(0xFFFCE7F3),
    onTertiaryContainer = Color(0xFF831843),
    background = AppColors.Background,
    onBackground = AppColors.TextPrimary,
    surface = AppColors.Surface,
    onSurface = AppColors.TextPrimary,
    surfaceVariant = Color(0xFFF0ECFF),
    onSurfaceVariant = AppColors.TextSecondary,
    surfaceContainerLowest = AppColors.Surface,
    surfaceContainerLow = AppColors.Surface,
    surfaceContainer = Color(0xFFF5F3FF),
    surfaceContainerHigh = Color(0xFFF0ECFF),
    surfaceContainerHighest = AppColors.Selected,
    surfaceTint = AppColors.Primary,
    outline = AppColors.Border,
    outlineVariant = Color(0xFFE9E5F5),
    error = AppColors.Error,
    onError = AppColors.OnPrimary,
    errorContainer = AppColors.ErrorContainer,
    onErrorContainer = AppColors.Error,
    scrim = AppColors.TextPrimary,
)

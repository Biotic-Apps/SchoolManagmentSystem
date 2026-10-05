package com.schoolapp.core.designsystem.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.lightColorScheme

internal val AppColorScheme: ColorScheme = lightColorScheme(
    primary = AppColors.Primary,
    onPrimary = AppColors.OnPrimary,
    primaryContainer = AppColors.Selected,
    onPrimaryContainer = AppColors.Primary,
    secondary = AppColors.TextSecondary,
    onSecondary = AppColors.OnPrimary,
    secondaryContainer = AppColors.Selected,
    onSecondaryContainer = AppColors.TextPrimary,
    tertiary = AppColors.Info,
    onTertiary = AppColors.OnPrimary,
    background = AppColors.Background,
    onBackground = AppColors.TextPrimary,
    surface = AppColors.Surface,
    onSurface = AppColors.TextPrimary,
    surfaceVariant = AppColors.Background,
    onSurfaceVariant = AppColors.TextSecondary,
    surfaceContainerLowest = AppColors.Surface,
    surfaceContainerLow = AppColors.Surface,
    surfaceContainer = AppColors.Surface,
    surfaceContainerHigh = AppColors.Surface,
    surfaceContainerHighest = AppColors.Background,
    surfaceTint = AppColors.Surface,
    outline = AppColors.Border,
    outlineVariant = AppColors.Border,
    error = AppColors.Error,
    onError = AppColors.OnPrimary,
    errorContainer = AppColors.ErrorContainer,
    onErrorContainer = AppColors.Error,
    scrim = AppColors.TextPrimary,
)

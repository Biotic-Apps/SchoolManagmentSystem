package com.schoolapp.core.designsystem.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private fun style(size: Int, weight: FontWeight, lineHeight: Int) = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = weight,
    fontSize = size.sp,
    lineHeight = lineHeight.sp,
)

/**
 * headlineSmall = page heading, titleLarge = card heading, bodyLarge = body/form,
 * labelLarge = buttons/menu, bodySmall/labelMedium = supporting labels.
 *
 * Headings use Bold for a modern, clean appearance.
 */
internal val AppTypography = Typography(
    headlineMedium = style(28, FontWeight.Bold, 36),
    headlineSmall = style(24, FontWeight.Bold, 32),
    titleLarge = style(18, FontWeight.Bold, 24),
    titleMedium = style(16, FontWeight.SemiBold, 22),
    titleSmall = style(14, FontWeight.SemiBold, 20),
    bodyLarge = style(16, FontWeight.Normal, 24),
    bodyMedium = style(14, FontWeight.Normal, 20),
    bodySmall = style(13, FontWeight.Normal, 18),
    labelLarge = style(16, FontWeight.SemiBold, 22),
    labelMedium = style(14, FontWeight.Medium, 20),
    labelSmall = style(13, FontWeight.Normal, 18),
)

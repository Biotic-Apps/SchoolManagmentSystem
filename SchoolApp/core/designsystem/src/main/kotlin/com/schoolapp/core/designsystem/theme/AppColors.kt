package com.schoolapp.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/** Raw design tokens (purple / lavender theme). A school's API primary colour overrides [Primary] for brand marks. */
object AppColors {
    val Primary = Color(0xFF7B68EE)
    val PrimaryPressed = Color(0xFF6A5ACD)
    val OnPrimary = Color(0xFFFFFFFF)
    val Background = Color(0xFFE8E0FF)
    val Surface = Color(0xFFFFFFFF)
    val Selected = Color(0xFFEDE9FE)
    val OnSelected = Color(0xFF7B68EE)
    val TextPrimary = Color(0xFF1F2037)
    val TextSecondary = Color(0xFF6B7280)
    val Border = Color(0xFFDDD6FE)
    val Accent = Color(0xFFEDE9FE)

    val Success = Color(0xFF1E7B45)
    val SuccessContainer = Color(0xFFE6F4EA)
    val Warning = Color(0xFF8A5A00)
    val WarningContainer = Color(0xFFFFF4DB)
    val Error = Color(0xFFB3261E)
    val ErrorContainer = Color(0xFFFCEBE9)
    val Info = Color(0xFF6366F1)
    val InfoContainer = Color(0xFFEDE9FE)
}

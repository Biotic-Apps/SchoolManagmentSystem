package com.schoolapp.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/** Raw design tokens (light teal theme). A school's API primary colour overrides [Primary] for brand marks. */
object AppColors {
    val Primary = Color(0xFF0B7F74)
    val PrimaryPressed = Color(0xFF096A61)
    val OnPrimary = Color(0xFFFFFFFF)
    val Background = Color(0xFFF5FAF9)
    val Surface = Color(0xFFFFFFFF)
    val Selected = Color(0xFFE6F5F2)
    val OnSelected = Color(0xFF075F57)
    val TextPrimary = Color(0xFF1F2A2E)
    val TextSecondary = Color(0xFF5F6E72)
    val Border = Color(0xFFDCE8E5)

    val Success = Color(0xFF1E7B45)
    val SuccessContainer = Color(0xFFE6F4EA)
    val Warning = Color(0xFF8A5A00)
    val WarningContainer = Color(0xFFFFF4DB)
    val Error = Color(0xFFB3261E)
    val ErrorContainer = Color(0xFFFCEBE9)
    val Info = Color(0xFF2A5C8F)
    val InfoContainer = Color(0xFFE8F0F9)
}

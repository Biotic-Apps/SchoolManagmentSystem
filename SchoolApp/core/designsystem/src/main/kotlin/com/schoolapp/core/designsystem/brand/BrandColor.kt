package com.schoolapp.core.designsystem.brand

import androidx.compose.ui.graphics.Color
import com.schoolapp.core.designsystem.theme.AppColors
import kotlin.math.pow

/** Same rule as the API: a school colour is used only if it reaches WCAG AA (4.5:1) against white. */
object BrandColor {
    const val MIN_CONTRAST = 4.5

    private val HexRegex = Regex("^#?([0-9a-fA-F]{6})$")

    /** Parsed [hex] when it is a valid 6-digit colour that passes the contrast rule, else null. */
    fun contrastSafeOrNull(hex: String?): Color? {
        val digits = hex?.trim()?.let { HexRegex.matchEntire(it)?.groupValues?.get(1) } ?: return null
        val color = Color(0xFF000000 or digits.toLong(16))
        return color.takeIf { contrastAgainstWhite(it) >= MIN_CONTRAST }
    }

    /** School primary colour if safe, otherwise the design-token primary. */
    fun primaryOrDefault(hex: String?): Color = contrastSafeOrNull(hex) ?: AppColors.Primary

    fun contrastAgainstWhite(color: Color): Double = (1.0 + 0.05) / (relativeLuminance(color) + 0.05)

    private fun relativeLuminance(color: Color): Double =
        0.2126 * channel(color.red) + 0.7152 * channel(color.green) + 0.0722 * channel(color.blue)

    private fun channel(value: Float): Double {
        val c = value.toDouble()
        return if (c <= 0.03928) c / 12.92 else ((c + 0.055) / 1.055).pow(2.4)
    }
}

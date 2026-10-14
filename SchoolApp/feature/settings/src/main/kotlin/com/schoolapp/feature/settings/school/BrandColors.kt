package com.schoolapp.feature.settings.school

import androidx.compose.ui.graphics.Color
import kotlin.math.floor
import kotlin.math.pow

/** WCAG 2.1 contrast of the school's primary colour against white text (web branding/contrast.ts). */
internal object BrandColors {
    const val DEFAULT_PRIMARY = "#7B68EE"
    const val MIN_CONTRAST = 4.5
    const val MAX_LENGTH = 7

    private val HEX = Regex("^#[0-9a-fA-F]{6}$")

    /** Ready-made colours (name resource index matches [PRESET_NAMES] in the UI). */
    val PRESETS = listOf(DEFAULT_PRIMARY, "#1E4E8C", "#1F7A45", "#4338CA", "#7A2944", "#334155")

    fun isHex(value: String): Boolean = HEX.matches(value.trim())

    /** Contrast ratio against white, or null when [hex] is not `#RRGGBB`. */
    fun contrastOnWhite(hex: String): Double? {
        if (!isHex(hex)) return null
        return WHITE_LUMINANCE_OFFSET / (luminance(hex.trim()) + LUMINANCE_OFFSET)
    }

    fun passes(hex: String): Boolean = contrastOnWhite(hex)?.let { it >= MIN_CONTRAST } == true

    /** Rounded down so a colour just under the minimum never reads as "4.5 : 1". */
    fun ratioText(ratio: Double): String = String.format(java.util.Locale.ENGLISH, "%.1f : 1", floor(ratio * TEN) / TEN)

    fun toColor(hex: String): Color? {
        if (!isHex(hex)) return null
        val value = hex.trim().substring(1).toLong(RADIX)
        return Color(OPAQUE or value)
    }

    private fun luminance(hex: String): Double {
        val n = hex.substring(1).toInt(RADIX)
        return R * channel((n shr 16) and BYTE) + G * channel((n shr 8) and BYTE) + B * channel(n and BYTE)
    }

    private fun channel(value: Int): Double {
        val c = value / 255.0
        return if (c <= LINEAR_LIMIT) c / LINEAR_DIVISOR else ((c + GAMMA_OFFSET) / GAMMA_DIVISOR).pow(GAMMA)
    }

    private const val RADIX = 16
    private const val BYTE = 255
    private const val OPAQUE = 0xFF000000L
    private const val TEN = 10.0
    private const val R = 0.2126
    private const val G = 0.7152
    private const val B = 0.0722
    private const val LINEAR_LIMIT = 0.03928
    private const val LINEAR_DIVISOR = 12.92
    private const val GAMMA_OFFSET = 0.055
    private const val GAMMA_DIVISOR = 1.055
    private const val GAMMA = 2.4
    private const val LUMINANCE_OFFSET = 0.05
    private const val WHITE_LUMINANCE_OFFSET = 1.05
}

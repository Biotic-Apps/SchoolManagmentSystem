package com.schoolapp.core.designsystem.money

import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

/**
 * Money is carried as integer minor units (paisa for PKR) and only formatted for display:
 * `1_250_000` → "Rs 12,500", `1_250_050` → "Rs 12,500.50", `-50_000` → "-Rs 500".
 */
object MoneyFormat {
    private const val MINOR_PER_MAJOR = 100L
    private const val MAX_DECIMALS = 2
    private val Symbols: Map<String, String> = mapOf("PKR" to "Rs")
    private val Grouped = DecimalFormatSymbols(Locale.ENGLISH)

    fun format(amountMinor: Long, currency: String = DEFAULT_CURRENCY): String {
        val sign = if (amountMinor < 0) "-" else ""
        val absolute = if (amountMinor == Long.MIN_VALUE) Long.MAX_VALUE else kotlin.math.abs(amountMinor)
        return "$sign${symbol(currency)} ${amount(absolute)}"
    }

    /** Digits only, grouped, without symbol: `1_250_000` → "12,500". */
    fun amount(amountMinor: Long): String {
        val major = amountMinor / MINOR_PER_MAJOR
        val fraction = kotlin.math.abs(amountMinor % MINOR_PER_MAJOR)
        val whole = DecimalFormat("#,##0", Grouped).format(major)
        return if (fraction == 0L) whole else "$whole.${fraction.toString().padStart(MAX_DECIMALS, '0')}"
    }

    fun symbol(currency: String): String = Symbols[currency.uppercase(Locale.ENGLISH)] ?: currency.uppercase(Locale.ENGLISH)

    /**
     * Parses what a user typed ("12,500", "12500.5") into minor units; null for blank, negative,
     * malformed input or more than two decimals.
     */
    fun parse(input: String): Long? {
        val clean = input.trim().replace(",", "")
        if (clean.isEmpty() || !Pattern.matches(clean)) return null
        return try {
            BigDecimal(clean).setScale(MAX_DECIMALS, RoundingMode.UNNECESSARY).movePointRight(MAX_DECIMALS).longValueExact()
        } catch (e: ArithmeticException) {
            null
        }
    }

    /** Minor units back to editable text without grouping: `1_250_050` → "12500.50". */
    fun toInput(amountMinor: Long): String {
        val major = amountMinor / MINOR_PER_MAJOR
        val fraction = amountMinor % MINOR_PER_MAJOR
        return if (fraction == 0L) major.toString() else "$major.${fraction.toString().padStart(MAX_DECIMALS, '0')}"
    }

    const val DEFAULT_CURRENCY = "PKR"
    private val Pattern = Regex("""^\d{1,13}(\.\d{1,2})?$""")
}

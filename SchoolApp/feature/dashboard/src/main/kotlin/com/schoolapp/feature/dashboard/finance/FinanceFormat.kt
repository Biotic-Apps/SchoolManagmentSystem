package com.schoolapp.feature.dashboard.finance

import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

private val MonthFormat = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)

/** `2026-10` → "October 2026". */
internal fun financeMonthLabel(month: String): String = runCatching { YearMonth.parse(month).format(MonthFormat) }.getOrDefault(month)

/** Collection rate (0–100) as a whole percentage: 82.4 → "82%". */
internal fun collectionRateLabel(rate: Double): String = "${rate.coerceIn(0.0, 100.0).roundToInt()}%"

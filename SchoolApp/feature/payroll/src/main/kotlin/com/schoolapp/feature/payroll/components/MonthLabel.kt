package com.schoolapp.feature.payroll.components

import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

private val MonthFormat = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)

/** "October 2026". */
internal fun YearMonth.label(): String = format(MonthFormat)

/** `YYYY-MM` → "October 2026"; unparseable values are shown as they are. */
internal fun monthLabel(month: String): String = runCatching { YearMonth.parse(month.take(7)).label() }.getOrDefault(month)

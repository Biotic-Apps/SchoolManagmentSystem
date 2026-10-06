package com.schoolapp.feature.fees.components

import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale

private val PeriodFormat = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH)
private const val PERIOD_LENGTH = 7

/** Billing period `YYYY-MM` as "Oct 2026"; anything else is shown as sent. */
internal fun periodLabel(period: String?): String? {
    if (period.isNullOrBlank()) return null
    return try {
        YearMonth.parse(period.take(PERIOD_LENGTH)).format(PeriodFormat)
    } catch (e: DateTimeParseException) {
        period
    }
}

/** "Class 5-A" style label from optional class and section names. */
internal fun classLabel(className: String?, sectionName: String?): String? = when {
    className.isNullOrBlank() -> sectionName?.takeIf { it.isNotBlank() }
    sectionName.isNullOrBlank() -> className
    else -> "$className-$sectionName"
}

package com.schoolapp.feature.approvals.detail.components

import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.ui.humanizeKey
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

private const val MINOR_SUFFIX = "Minor"
private val MonthKey = Regex("""^\d{4}-\d{2}$""")
private val MonthFormat = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)

/** Row label for a flattened payload key: last segment, without a `Minor` suffix ("totalMinor" → "Total"). */
internal fun detailLabel(key: String): String {
    val last = key.substringAfterLast('.')
    return humanizeKey(if (last.length > MINOR_SUFFIX.length && last.endsWith(MINOR_SUFFIX)) last.removeSuffix(MINOR_SUFFIX) else last)
}

/**
 * Display value for a payload entry: `…Minor` amounts as money ("1250000" → "Rs 12,500"), `YYYY-MM` months as
 * "October 2026", enum keys humanized ("SCHOOL_LEAVING" → "School leaving"), anything else unchanged.
 */
internal fun detailValue(key: String, value: String, currency: String = MoneyFormat.DEFAULT_CURRENCY): String {
    val last = key.substringAfterLast('.')
    if (last.endsWith(MINOR_SUFFIX)) {
        value.trim().toLongOrNull()?.let { return MoneyFormat.format(it, currency) }
    }
    if (MonthKey.matches(value)) {
        runCatching { YearMonth.parse(value).format(MonthFormat) }.getOrNull()?.let { return it }
    }
    return if (EnumValue.matches(value)) humanizeKey(value) else value
}

/** Server enum keys such as `PERCENT` or `SCHOOL_LEAVING` (not codes like "BS-2026-0020" or a section "B"). */
private val EnumValue = Regex("""^[A-Z]{2,}(_[A-Z]+)*$""")

package com.schoolapp.feature.payroll.setup

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.ui.humanizeKey
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

private val MonthFormat = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)

/** `HEAD_TEACHER` -> "Head teacher"; free-text designations are shown as stored. */
@Composable
internal fun staffTypeLabel(designation: String?): String? {
    val value = designation?.trim()?.takeIf { it.isNotEmpty() } ?: return null
    val known = StaffType.entries.firstOrNull { it.name == value.uppercase(Locale.ENGLISH) }
    return known?.let { stringResource(it.label) } ?: if (value.matches(Regex("^[A-Z0-9_]+$"))) humanizeKey(value) else value
}

/** `2026-07` -> "July 2026"; anything else is shown as it is. */
internal fun yearMonthLabel(month: String): String =
    runCatching { YearMonth.parse(month.take(7)).format(MonthFormat) }.getOrDefault(month)

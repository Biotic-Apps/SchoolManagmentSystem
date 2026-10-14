package com.schoolapp.feature.reports.form

import com.schoolapp.core.designsystem.component.SwitcherOption
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

private val MonthFormat = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)

/** `YYYY-MM` as "October 2026"; unparseable values are shown as they are. */
internal fun monthLabel(month: String): String =
    runCatching { YearMonth.parse(month.take(MONTH_LENGTH)).format(MonthFormat) }.getOrDefault(month)

/** This month first, then the previous [COUNT] - 1 months (reports cover the past). */
internal fun monthOptions(current: YearMonth = YearMonth.now()): List<SwitcherOption> =
    (0 until COUNT).map { offset ->
        val month = current.minusMonths(offset.toLong())
        SwitcherOption(month.toString(), month.format(MonthFormat))
    }

private const val COUNT = 36
private const val MONTH_LENGTH = 7

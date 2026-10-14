package com.schoolapp.feature.accounts.common

import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

/** Quick ranges for reports; dates are inclusive `YYYY-MM-DD`. */
enum class RangePreset { THIS_MONTH, LAST_MONTH, THIS_YEAR, CUSTOM }

data class DateRange(val from: String, val to: String) {
    /** Both set and in order. */
    val isValid: Boolean get() = from.isNotEmpty() && to.isNotEmpty() && from <= to

    companion object {
        fun of(preset: RangePreset, today: LocalDate): DateRange = when (preset) {
            RangePreset.THIS_MONTH, RangePreset.CUSTOM -> DateRange(today.withDayOfMonth(1).toString(), today.toString())
            RangePreset.LAST_MONTH -> {
                val start = today.minusMonths(1).withDayOfMonth(1)
                DateRange(start.toString(), start.with(TemporalAdjusters.lastDayOfMonth()).toString())
            }
            RangePreset.THIS_YEAR -> DateRange(today.withDayOfYear(1).toString(), today.toString())
        }
    }
}

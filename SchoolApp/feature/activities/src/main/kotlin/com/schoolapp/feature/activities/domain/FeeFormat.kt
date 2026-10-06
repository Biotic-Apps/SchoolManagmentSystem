package com.schoolapp.feature.activities.domain

import java.text.NumberFormat
import java.util.Locale

/** Minor units (paisa) -> "Rs 1,500" (or "Rs 1,500.50" when there are paisa). */
object FeeFormat {
    fun format(minor: Long): String {
        val format = NumberFormat.getNumberInstance(Locale.ENGLISH).apply {
            minimumFractionDigits = if (minor % MINOR_PER_UNIT == 0L) 0 else 2
            maximumFractionDigits = minimumFractionDigits
        }
        return "Rs " + format.format(minor / MINOR_PER_UNIT.toDouble())
    }

    private const val MINOR_PER_UNIT = 100L
}

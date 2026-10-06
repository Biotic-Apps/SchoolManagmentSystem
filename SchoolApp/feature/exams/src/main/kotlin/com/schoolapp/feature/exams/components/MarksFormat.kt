package com.schoolapp.feature.exams.components

import java.math.BigDecimal
import java.math.RoundingMode

/** Marks or a percentage without trailing zeros: "45", "45.5", "45.25". */
internal fun formatMarks(value: Double): String =
    BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString()

/** Whole percentage of [part] in [total] (0 when there is nothing to count). */
internal fun percentOf(part: Int, total: Int): Int = if (total <= 0) 0 else part * 100 / total

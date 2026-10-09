package com.schoolapp.feature.dashboard.parent

import com.schoolapp.core.designsystem.component.StatusTone

private const val GOOD_PERCENT = 90.0
private const val FAIR_PERCENT = 75.0

/** Month attendance colour: 90%+ good, 75%+ watch, below that a concern; no marked days stays neutral. */
internal fun attendanceTone(percent: Double?): StatusTone = when {
    percent == null -> StatusTone.Neutral
    percent >= GOOD_PERCENT -> StatusTone.Success
    percent >= FAIR_PERCENT -> StatusTone.Warning
    else -> StatusTone.Error
}

/** "92%" or "92.5%"; null when nothing was marked this month. */
internal fun percentText(percent: Double?): String? = percent?.let {
    val rounded = Math.round(it * 10) / 10.0
    if (rounded % 1.0 == 0.0) "${rounded.toInt()}%" else "$rounded%"
}

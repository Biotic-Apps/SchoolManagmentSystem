package com.schoolapp.feature.payroll.components

import com.schoolapp.core.ui.humanizeKey

private val CODE = Regex("^[A-Z0-9_]+$")

/** `PRINCIPAL` / `VICE_PRINCIPAL` -> "Principal" / "Vice principal"; free text is shown as stored. */
internal fun designationLabel(designation: String?): String? {
    val value = designation?.trim()?.takeIf { it.isNotEmpty() } ?: return null
    return if (CODE.matches(value)) humanizeKey(value) else value
}

/** Overtime minutes as "3 h", "2 h 30 min" or "45 min". */
internal fun formatHours(minutes: Int): String {
    val hours = minutes / 60
    val rest = minutes % 60
    return when {
        hours == 0 -> "$rest min"
        rest == 0 -> "$hours h"
        else -> "$hours h $rest min"
    }
}

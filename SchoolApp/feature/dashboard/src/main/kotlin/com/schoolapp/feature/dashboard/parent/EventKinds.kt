package com.schoolapp.feature.dashboard.parent

import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.dashboard.R

internal data class EventKindLabel(val labelRes: Int, val tone: StatusTone)

/** Calendar kind chip; unknown kinds read as a plain event. */
internal fun eventKind(kind: String?): EventKindLabel = when (kind) {
    "ACTIVITY" -> EventKindLabel(R.string.dashboard_event_activity, StatusTone.Info)
    "HOLIDAY" -> EventKindLabel(R.string.dashboard_event_holiday, StatusTone.Success)
    "VACATION" -> EventKindLabel(R.string.dashboard_event_vacation, StatusTone.Success)
    "DEADLINE" -> EventKindLabel(R.string.dashboard_event_deadline, StatusTone.Warning)
    else -> EventKindLabel(R.string.dashboard_event_event, StatusTone.Neutral)
}

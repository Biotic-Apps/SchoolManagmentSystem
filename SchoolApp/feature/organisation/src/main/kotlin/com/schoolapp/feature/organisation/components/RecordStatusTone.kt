package com.schoolapp.feature.organisation.components

import com.schoolapp.core.designsystem.component.StatusTone

internal fun recordStatusTone(status: String): StatusTone = when (status) {
    "ACTIVE" -> StatusTone.Success
    "DRAFT" -> StatusTone.Info
    "CLOSED", "ARCHIVED" -> StatusTone.Neutral
    else -> StatusTone.Neutral
}

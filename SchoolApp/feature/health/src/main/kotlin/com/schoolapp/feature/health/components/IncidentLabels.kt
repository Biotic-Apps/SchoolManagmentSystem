package com.schoolapp.feature.health.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.health.R

@Composable
internal fun incidentTypeLabel(type: IncidentType): String = stringResource(
    when (type) {
        IncidentType.INJURY -> R.string.health_type_injury
        IncidentType.ILLNESS -> R.string.health_type_illness
        IncidentType.ALLERGIC_REACTION -> R.string.health_type_allergic_reaction
        IncidentType.OTHER -> R.string.health_type_other
    },
)

@Composable
internal fun severityLabel(severity: IncidentSeverity): String = stringResource(
    when (severity) {
        IncidentSeverity.MINOR -> R.string.health_severity_minor
        IncidentSeverity.MODERATE -> R.string.health_severity_moderate
        IncidentSeverity.SERIOUS -> R.string.health_severity_serious
    },
)

internal fun IncidentSeverity.tone(): StatusTone = when (this) {
    IncidentSeverity.SERIOUS -> StatusTone.Error
    IncidentSeverity.MODERATE -> StatusTone.Warning
    IncidentSeverity.MINOR -> StatusTone.Info
}

@Composable
internal fun incidentStatusLabel(status: String): String = when (status) {
    STATUS_REPORTED -> stringResource(R.string.health_status_reported)
    STATUS_PARENT_NOTIFIED -> stringResource(R.string.health_status_parent_notified)
    STATUS_CLOSED -> stringResource(R.string.health_status_closed)
    else -> humanizeKey(status)
}

internal fun incidentStatusTone(status: String?): StatusTone = when (status) {
    STATUS_CLOSED -> StatusTone.Success
    STATUS_PARENT_NOTIFIED -> StatusTone.Info
    STATUS_REPORTED -> StatusTone.Warning
    else -> StatusTone.Neutral
}

/** Allergy severity entered by parents / office: free text, but these three are offered as chips. */
internal val AllergySeverities = listOf("MILD", "MODERATE", "SEVERE")

@Composable
internal fun allergySeverityLabel(severity: String): String = when (severity.uppercase()) {
    "MILD" -> stringResource(R.string.health_severity_mild)
    "MODERATE" -> stringResource(R.string.health_severity_moderate)
    "SEVERE" -> stringResource(R.string.health_severity_severe)
    else -> humanizeKey(severity)
}

internal const val STATUS_REPORTED = "REPORTED"
internal const val STATUS_PARENT_NOTIFIED = "PARENT_NOTIFIED"
internal const val STATUS_CLOSED = "CLOSED"

package com.schoolapp.feature.health.report

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.feature.health.components.StudentSearchState

enum class IncidentField { STUDENT, DESCRIPTION, ACTION_TAKEN, FUTURE_TIME }

/** [date] is `YYYY-MM-DD`, [time] is `HH:mm` (shown in 12-hour form). [submitted] switches to the success view. */
@Immutable
data class ReportIncidentUiState(
    val studentId: String? = null,
    val studentName: String? = null,
    val studentLocked: Boolean = false,
    val search: StudentSearchState = StudentSearchState(),
    val today: String = "",
    val date: String = "",
    val time: String = "",
    val type: IncidentType = IncidentType.INJURY,
    val severity: IncidentSeverity = IncidentSeverity.MINOR,
    val description: String = "",
    val actionTaken: String = "",
    val attachments: AttachmentDraft = AttachmentDraft(),
    val errors: Set<IncidentField> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
    val submitted: Incident? = null,
)

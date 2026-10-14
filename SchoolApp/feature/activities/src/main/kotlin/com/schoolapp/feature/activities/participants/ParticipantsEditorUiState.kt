package com.schoolapp.feature.activities.participants

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.people.StudentSummary

/** One editable roster row; [position] is kept as typed (digits only). */
@Immutable
data class ParticipantRow(
    val studentId: String,
    val name: String,
    val role: String = "",
    val result: String = "",
    val position: String = "",
    val remarks: String = "",
) {
    fun toParticipant() = ActivityParticipant(
        studentId = studentId,
        studentName = name,
        role = role.trim().ifEmpty { null },
        result = result.trim().ifEmpty { null },
        position = position.trim().toIntOrNull()?.takeIf { it > 0 },
        remarks = remarks.trim().ifEmpty { null },
    )
}

internal fun ActivityParticipant.toRow() = ParticipantRow(
    studentId = studentId,
    name = studentName,
    role = role.orEmpty(),
    result = result.orEmpty(),
    position = position?.toString().orEmpty(),
    remarks = remarks.orEmpty(),
)

/** A student that may be added: from granted consents, or from the student search. */
@Immutable
data class Candidate(val studentId: String, val name: String, val detail: String? = null)

@Immutable
data class ParticipantsEditorUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val title: String = "",
    val consentRequired: Boolean = false,
    val maxParticipants: Int? = null,
    val rows: List<ParticipantRow> = emptyList(),
    /** Consent activities: students whose parents granted consent and are not listed yet. */
    val granted: List<Candidate> = emptyList(),
    val search: String = "",
    val results: List<Candidate> = emptyList(),
    val isSearching: Boolean = false,
    val searchError: AppError? = null,
    val dirty: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
    val confirmRemove: ParticipantRow? = null,
) {
    val overLimit: Boolean get() = maxParticipants != null && rows.size > maxParticipants
}

internal fun StudentSummary.toCandidate() = Candidate(
    studentId = id,
    name = name,
    detail = listOfNotNull(listOfNotNull(className, sectionName).joinToString(" ").takeIf { it.isNotBlank() }, admissionNo).joinToString(" · "),
)

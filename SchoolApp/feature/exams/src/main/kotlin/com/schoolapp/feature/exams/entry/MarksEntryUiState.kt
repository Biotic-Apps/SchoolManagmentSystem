package com.schoolapp.feature.exams.entry

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.MarkEntry
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.feature.exams.components.formatMarks

enum class MarksAction { DRAFT, SUBMIT }

enum class MarksMessage { DRAFT_SAVED, SUBMITTED, QUEUED, PENDING_REVIEW }

/** What the teacher typed for one student; [text] is kept raw so "12." can be typed. */
@Immutable
data class MarkInput(val text: String = "", val absent: Boolean = false, val remark: String? = null)

/**
 * The save/submit in flight or last failed: retrying the same action with the same marks reuses
 * [clientRequestId] so the server applies it once; any change or a completed attempt gets a new id.
 */
@Immutable
data class PendingAttempt(val action: MarksAction, val clientRequestId: String, val entries: List<MarkEntry>)

@Immutable
data class MarkRowUi(
    val studentId: String,
    val name: String,
    val rollNo: Int?,
    val text: String,
    val absent: Boolean,
    val error: MarkError?,
) {
    /** Not entered and not absent; 0 is entered, never pending. */
    val isPending: Boolean get() = !absent && error == null && text.isBlank()
}

@Immutable
data class MarkCounts(val entered: Int = 0, val absent: Int = 0, val pending: Int = 0, val invalid: Int = 0)

@Immutable
data class MarksEntryUiState(
    val title: String = "",
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val sheet: MarkSheet? = null,
    val inputs: Map<String, MarkInput> = emptyMap(),
    val offline: Boolean = false,
    val hasUnsentChanges: Boolean = false,
    val syncState: MarkSheetSyncState = MarkSheetSyncState.NONE,
    val canEdit: Boolean = false,
    val canSubmit: Boolean = false,
    val busyAction: MarksAction? = null,
    val pendingAttempt: PendingAttempt? = null,
    val actionError: AppError? = null,
    val message: MarksMessage? = null,
    val pendingBlocking: Int? = null,
    val invalidBlocking: Boolean = false,
    val confirmSubmit: Boolean = false,
    /** One-shot: scroll to (and focus) this student's row. */
    val scrollToStudentId: String? = null,
) {
    val status: MarkSheetStatus get() = sheet?.status ?: MarkSheetStatus.NOT_ENTERED

    val isReadOnly: Boolean get() = !canEdit || !status.isEditable

    val maxMarks: Double get() = sheet?.maxMarks ?: 0.0

    val rows: List<MarkRowUi>
        get() = sheet?.rows.orEmpty().map { row ->
            val input = inputs[row.studentId] ?: MarkInput()
            val parsed = if (input.absent) ParsedMarks.Blank else MarksValidation.parse(input.text, maxMarks)
            MarkRowUi(
                studentId = row.studentId,
                name = row.name,
                rollNo = row.rollNo,
                text = if (input.absent) "" else input.text,
                absent = input.absent,
                error = (parsed as? ParsedMarks.Invalid)?.error,
            )
        }

    val counts: MarkCounts
        get() = rows.let { rows ->
            MarkCounts(
                entered = rows.count { !it.absent && it.error == null && it.text.isNotBlank() },
                absent = rows.count { it.absent },
                pending = rows.count { it.isPending },
                invalid = rows.count { it.error != null },
            )
        }

    /** Rows to send; call only when there are no invalid rows. Blank marks go as null (pending). */
    fun entries(): List<MarkEntry> = sheet?.rows.orEmpty().map { row ->
        val input = inputs[row.studentId] ?: MarkInput()
        val marks = (MarksValidation.parse(input.text, maxMarks) as? ParsedMarks.Value)?.marks
        MarkEntry(row.studentId, if (input.absent) null else marks, input.absent, input.remark)
    }

    companion object {
        fun inputsOf(sheet: MarkSheet): Map<String, MarkInput> = sheet.rows.associate { row ->
            row.studentId to MarkInput(text = row.marks?.let(::formatMarks).orEmpty(), absent = row.absent, remark = row.remark)
        }
    }
}

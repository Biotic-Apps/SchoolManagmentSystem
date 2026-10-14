package com.schoolapp.feature.exams.schedule

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.common.PersonRef

/** Papers of one class of the exam. */
@Immutable
data class ScheduleGroup(val classId: String, val className: String, val rows: List<ScheduleRow>)

/** The paper being edited in the sheet; [isNew] = not in the list yet. */
@Immutable
data class PaperDraft(val row: ScheduleRow, val isNew: Boolean, val problems: List<RowProblem> = emptyList())

@Immutable
data class ScheduleState(
    val examId: String? = null,
    val rows: List<ScheduleRow> = emptyList(),
    /** Saved rows, to know whether there are unsaved changes. */
    val savedSignature: List<List<String?>> = emptyList(),
    val classNames: Map<String, String> = emptyMap(),
    val classIds: List<String> = emptyList(),
    val subjects: Map<String, List<PersonRef>> = emptyMap(),
    val rooms: List<PersonRef> = emptyList(),
    val canEdit: Boolean = false,
    val readOnly: Boolean = true,
    val isDraftExam: Boolean = false,
    val draft: PaperDraft? = null,
    val confirmRemoveKey: String? = null,
    val confirmDiscard: Boolean = false,
    val rowProblems: Map<String, List<RowProblem>> = emptyMap(),
    /** Clash or general messages from the server, per row key; [generalErrors] are not tied to a row. */
    val rowClashes: Map<String, List<String>> = emptyMap(),
    val generalErrors: List<String> = emptyList(),
    val noPapers: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
) {
    val dirty: Boolean get() = !readOnly && ScheduleRows.signature(rows) != savedSignature

    /** A DRAFT exam can save its papers as they are to become SCHEDULED. */
    val canSave: Boolean get() = !readOnly && (dirty || (isDraftExam && rows.isNotEmpty()))

    val groups: List<ScheduleGroup>
        get() = classIds.map { id -> ScheduleGroup(id, classNames[id].orEmpty(), rows.filter { it.classId == id }.sortedWith(compareBy({ it.date }, { it.startTime }))) }

    fun subjectName(row: ScheduleRow): String? = subjects[row.classId]?.firstOrNull { it.id == row.subjectId }?.name

    fun roomName(row: ScheduleRow): String? = row.roomId?.let { id -> rooms.firstOrNull { it.id == id }?.name }
}

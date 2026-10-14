package com.schoolapp.feature.exams.schedule

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

/** Add / edit one paper in a sheet; [commit] validates it against the other rows before putting it in the list. */
internal class PaperEditor(private val state: MutableStateFlow<ScheduleState>) {

    fun openNew(classId: String) = state.update { current ->
        if (current.readOnly) return@update current
        val last = current.rows.lastOrNull { it.classId == classId }
        current.copy(draft = PaperDraft(ScheduleRows.newRow(classId, last), isNew = true))
    }

    fun openEdit(key: String) = state.update { current ->
        val row = current.rows.firstOrNull { it.key == key } ?: return@update current
        if (current.readOnly) current else current.copy(draft = PaperDraft(row, isNew = false))
    }

    fun dismiss() = state.update { it.copy(draft = null) }

    fun onSubject(id: String) = edit { it.copy(subjectId = id) }

    fun onDate(date: String) = edit { it.copy(date = date) }

    fun onStart(time: String) = edit { it.copy(startTime = time) }

    fun onEnd(time: String) = edit { it.copy(endTime = time) }

    fun onMax(value: String) = edit { it.copy(maxMarks = value.filter(Char::isDigit).take(MAX_DIGITS)) }

    fun onPass(value: String) = edit { it.copy(passMarks = value.filter(Char::isDigit).take(MAX_DIGITS)) }

    fun onRoom(id: String?) = edit { it.copy(roomId = id) }

    fun commit() = state.update { current ->
        val draft = current.draft ?: return@update current
        val others = current.rows.filterNot { it.key == draft.row.key }
        val problems = ScheduleRows.problems(draft.row, others + draft.row)
        if (problems.isNotEmpty()) return@update current.copy(draft = draft.copy(problems = problems))
        val rows = if (draft.isNew) current.rows + draft.row else current.rows.map { if (it.key == draft.row.key) draft.row else it }
        current.copy(
            rows = rows,
            draft = null,
            rowProblems = current.rowProblems - draft.row.key,
            rowClashes = current.rowClashes - draft.row.key,
            noPapers = false,
            saved = false,
        )
    }

    private fun edit(transform: (ScheduleRow) -> ScheduleRow) = state.update { current ->
        current.draft?.let { current.copy(draft = it.copy(row = transform(it.row), problems = emptyList())) } ?: current
    }

    private companion object {
        const val MAX_DIGITS = 4
    }
}

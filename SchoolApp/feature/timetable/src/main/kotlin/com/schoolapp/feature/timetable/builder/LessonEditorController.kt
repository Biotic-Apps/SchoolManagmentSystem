package com.schoolapp.feature.timetable.builder

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

/** Opens and fills the lesson sheet; choosing a subject pre-fills its allocated teacher (unless one was picked by hand). */
internal class LessonEditorController(private val state: MutableStateFlow<BuilderUiState>) {

    fun open(day: Int, periodIndex: Int) = state.update { s ->
        if (!s.canEdit) return@update s
        val slot = s.builder?.draft?.slotAt(day, periodIndex)
        s.copy(
            editor = LessonEditor(
                day = day,
                periodIndex = periodIndex,
                subjectId = slot?.subject?.id,
                staffId = slot?.staff?.id,
                roomId = slot?.room?.id,
                existing = slot != null,
            ),
        )
    }

    fun close() = state.update { it.copy(editor = null) }

    fun setSubject(subjectId: String) = edit { s, e ->
        val teacher = s.builder?.lessons?.firstOrNull { it.subject.id == subjectId }?.teacher?.id
        val previousTeacher = s.builder?.lessons?.firstOrNull { it.subject.id == e.subjectId }?.teacher?.id
        val keepStaff = e.staffId != null && e.staffId != previousTeacher
        e.copy(subjectId = subjectId, staffId = if (keepStaff || teacher == null) e.staffId else teacher)
    }

    fun setStaff(staffId: String?) = edit { _, e -> e.copy(staffId = staffId) }

    fun setRoom(roomId: String?) = edit { _, e -> e.copy(roomId = roomId) }

    fun setAllocate(allocate: Boolean) = edit { _, e -> e.copy(allocate = allocate) }

    /** "Make X the English teacher here" is offered only when nobody teaches the subject in this section yet. */
    fun canAllocate(s: BuilderUiState): Boolean {
        val e = s.editor ?: return false
        val lesson = s.builder?.lessons?.firstOrNull { it.subject.id == e.subjectId } ?: return false
        return lesson.teacher == null && e.staffId != null
    }

    private fun edit(change: (BuilderUiState, LessonEditor) -> LessonEditor) =
        state.update { s -> s.copy(editor = s.editor?.let { change(s, it) }) }
}

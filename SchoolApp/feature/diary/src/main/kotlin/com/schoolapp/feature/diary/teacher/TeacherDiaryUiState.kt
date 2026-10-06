package com.schoolapp.feature.diary.teacher

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.feature.diary.editor.DiaryEditResult

/** One subject line of a section: a saved [entry], an entry still in the outbox, or a timetable subject not written yet. */
@Immutable
data class DiaryRow(
    val key: String,
    val subjectId: String?,
    val subjectName: String?,
    val entry: DiaryEntry?,
    val queued: Boolean,
)

@Immutable
data class SectionDiary(val sectionId: String, val title: String, val rows: List<DiaryRow>)

@Immutable
data class TeacherDiaryUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val date: String = "",
    val today: String = "",
    val sections: List<SectionDiary> = emptyList(),
    val message: DiaryEditResult? = null,
)

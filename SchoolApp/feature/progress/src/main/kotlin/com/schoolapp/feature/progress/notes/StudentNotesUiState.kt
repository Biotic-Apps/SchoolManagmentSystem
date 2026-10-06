package com.schoolapp.feature.progress.notes

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNote

@Immutable
data class StudentNotesUiState(
    val studentName: String = "",
    val rollNo: Int? = null,
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val notes: List<ProgressNote> = emptyList(),
    val canAdd: Boolean = false,
    val form: NoteForm? = null,
    val message: NoteMessage? = null,
)

@Immutable
data class NoteForm(
    val category: ProgressCategory? = null,
    val note: String = "",
    val visibleToParent: Boolean = true,
    val isSaving: Boolean = false,
    val categoryMissing: Boolean = false,
    val noteError: NoteError? = null,
    val error: AppError? = null,
)

enum class NoteError { REQUIRED, TOO_LONG }

enum class NoteMessage { SAVED, PENDING_REVIEW }

const val NOTE_MAX_LENGTH = 1000

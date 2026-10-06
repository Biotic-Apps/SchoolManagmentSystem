package com.schoolapp.feature.diary.editor

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.organisation.Subject

@Immutable
data class EditorAttachment(val id: String, val name: String, val url: String?, val isImage: Boolean)

enum class EditorAction { SAVE_DRAFT, PUBLISH }

@Immutable
data class DiaryEditorUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val title: String? = null,
    val date: String = "",
    val subjects: List<Subject> = emptyList(),
    val subjectId: String? = null,
    val topics: String = "",
    val homework: String = "",
    val dueDate: String? = null,
    val attachments: List<EditorAttachment> = emptyList(),
    val isUploading: Boolean = false,
    val uploadError: AppError? = null,
    /** Existing server entry for the chosen subject, if any. */
    val entry: DiaryEntry? = null,
    val canEdit: Boolean = false,
    val canPublish: Boolean = false,
    val isHelper: Boolean = false,
    val busyAction: EditorAction? = null,
    val error: AppError? = null,
    /** Server refused the edit after the diary closing time (423). */
    val locked: Boolean = false,
    val subjectMissing: Boolean = false,
    val topicsMissing: Boolean = false,
    val dueDateInvalid: Boolean = false,
    val result: DiaryEditResult? = null,
) {
    val isReadOnly: Boolean get() = locked || !canEdit
    val isBusy: Boolean get() = busyAction != null || isUploading
}

package com.schoolapp.feature.questionbank.paper

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.core.model.questions.Question

enum class PaperNotice { GENERATED, PUBLISHED, MOVED_TO_DRAFT }

@Immutable
data class PaperDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val paper: ExamPaper? = null,
    /** Picked questions by id; ids missing here were archived or could not be loaded. */
    val questions: Map<String, Question> = emptyMap(),
    val questionsLoading: Boolean = false,
    val canPublish: Boolean = false,
    val isDownloading: Boolean = false,
    /** `content://` uri of the downloaded PDF, waiting to be opened. */
    val openUri: String? = null,
    val isUpdatingStatus: Boolean = false,
    val actionError: AppError? = null,
    val notice: PaperNotice? = null,
)

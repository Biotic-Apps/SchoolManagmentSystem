package com.schoolapp.feature.syllabus.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.TopicStatus

enum class ProgressMessage { SAVED, PENDING_REVIEW, QUEUED }

/** Open bottom sheet; [clientRequestId] is fixed per sheet so a retried save is not applied twice. */
@Immutable
data class TopicEditor(
    val topicId: String,
    val topicTitle: String,
    val status: TopicStatus,
    val completedOn: String?,
    val note: String = "",
    val clientRequestId: String,
    val isSaving: Boolean = false,
    val dateMissing: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class PlanDetailUiState(
    val isLoading: Boolean = true,
    val plan: SyllabusPlan? = null,
    val notFound: Boolean = false,
    val error: AppError? = null,
    val canEdit: Boolean = false,
    val queuedTopicIds: Set<String> = emptySet(),
    val today: String = "",
    val editor: TopicEditor? = null,
    val message: ProgressMessage? = null,
)

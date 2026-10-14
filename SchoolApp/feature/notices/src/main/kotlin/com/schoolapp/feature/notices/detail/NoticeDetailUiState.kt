package com.schoolapp.feature.notices.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeReads
import com.schoolapp.feature.notices.NoticeComposeResult

@Immutable
data class NoticeDetailUiState(
    val isLoading: Boolean = true,
    val notice: Notice? = null,
    val error: AppError? = null,
    val canEdit: Boolean = false,
    val canPublish: Boolean = false,
    val canSeeReads: Boolean = false,
    val reads: NoticeReads? = null,
    val readsLoading: Boolean = false,
    val readsError: AppError? = null,
    val confirmPublish: Boolean = false,
    val isPublishing: Boolean = false,
    val actionError: AppError? = null,
    val message: NoticeComposeResult? = null,
)

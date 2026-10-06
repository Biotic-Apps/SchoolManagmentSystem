package com.schoolapp.feature.notices.feed

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.feature.notices.NoticeComposeResult

@Immutable
data class NoticesFeedUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val notices: List<Notice> = emptyList(),
    val canAdd: Boolean = false,
    val message: NoticeComposeResult? = null,
)

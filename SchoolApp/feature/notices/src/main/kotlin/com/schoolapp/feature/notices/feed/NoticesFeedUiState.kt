package com.schoolapp.feature.notices.feed

import androidx.compose.runtime.Immutable
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.paging.NoticePage

@Immutable
data class NoticesFeedUiState(
    val page: NoticePage = NoticePage(),
    val canAdd: Boolean = false,
    val message: NoticeComposeResult? = null,
)

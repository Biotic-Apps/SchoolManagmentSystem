package com.schoolapp.feature.meetings.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.Meeting

@Immutable
data class ParentMeetingsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val noChild: Boolean = false,
    val upcoming: List<Meeting> = emptyList(),
    val past: List<Meeting> = emptyList(),
)

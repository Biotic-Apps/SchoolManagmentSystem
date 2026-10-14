package com.schoolapp.feature.meetings.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.domain.MeetingPage

@Immutable
data class ParentMeetingsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val noChild: Boolean = false,
    val upcoming: MeetingPage = MeetingPage(),
    val past: MeetingPage = MeetingPage(),
) {
    fun page(box: MeetingBox): MeetingPage = if (box == MeetingBox.UPCOMING) upcoming else past
}

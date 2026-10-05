package com.schoolapp.feature.notifications

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.notification.AppNotification

@Immutable
data class NotificationsUiState(
    val unreadOnly: Boolean = false,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val items: List<AppNotification> = emptyList(),
    val error: AppError? = null,
    val actionError: AppError? = null,
    val isMarkingAll: Boolean = false,
) {
    val hasUnread: Boolean get() = items.any { !it.isRead }
}

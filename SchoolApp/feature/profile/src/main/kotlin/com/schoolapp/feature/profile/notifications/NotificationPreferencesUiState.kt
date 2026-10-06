package com.schoolapp.feature.profile.notifications

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.notification.NotificationPreference

@Immutable
data class NotificationPreferencesUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val items: List<NotificationPreference> = emptyList(),
    /** Categories whose push change is being saved. */
    val saving: Set<String> = emptySet(),
    val saveError: AppError? = null,
)

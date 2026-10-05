package com.schoolapp.feature.profile.sessions

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.profile.DeviceSession

@Immutable
data class DeviceSessionsUiState(
    val isLoading: Boolean = true,
    val sessions: List<DeviceSession> = emptyList(),
    val loadError: AppError? = null,
    val revokingId: String? = null,
    val isLoggingOutAll: Boolean = false,
    val actionError: AppError? = null,
)

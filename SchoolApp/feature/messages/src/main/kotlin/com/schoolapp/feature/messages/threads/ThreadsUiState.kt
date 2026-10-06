package com.schoolapp.feature.messages.threads

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.message.MessageThread
import java.time.LocalDate

@Immutable
data class ThreadsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isParent: Boolean = false,
    val myUserId: String? = null,
    /** Parent: the active child the list is filtered to. */
    val childId: String? = null,
    val threads: List<MessageThread> = emptyList(),
    val error: AppError? = null,
    val today: LocalDate = LocalDate.MIN,
)

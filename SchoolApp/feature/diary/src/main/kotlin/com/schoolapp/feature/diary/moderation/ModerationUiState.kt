package com.schoolapp.feature.diary.moderation

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.feature.diary.supervisor.ReturnEditor

/** One-shot outcome shown in a snackbar. */
sealed interface ModerationEvent {
    data object Published : ModerationEvent
    data object Returned : ModerationEvent
    data class Failed(val error: AppError) : ModerationEvent
}

/** Web ModerationTab: SUBMITTED diary entries of a branch waiting for a supervisor. */
@Immutable
data class ModerationUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    /** Only filled when the user can pick between several branches. */
    val branches: List<Branch> = emptyList(),
    val branchId: String? = null,
    val entries: List<DiaryEntry> = emptyList(),
    val error: AppError? = null,
    val publishingId: String? = null,
    val returnEditor: ReturnEditor? = null,
)

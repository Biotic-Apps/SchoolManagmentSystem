package com.schoolapp.feature.diary.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.diary.DiaryEntry

@Immutable
data class DiaryDay(val date: String, val entries: List<DiaryEntry>)

@Immutable
data class ParentDiaryUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val childId: String? = null,
    val childName: String? = null,
    /** Child has no section yet (not enrolled). */
    val noSection: Boolean = false,
    val days: List<DiaryDay> = emptyList(),
)

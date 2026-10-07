package com.schoolapp.feature.progress.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.progress.HomeworkCompletionItem

/** Parent "Homework" tab: the active child's homework over the last [days] days, newest first. */
@Immutable
data class ChildHomeworkUiState(
    val childId: String? = null,
    val childName: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val items: List<HomeworkCompletionItem> = emptyList(),
    val tally: HomeworkTally = HomeworkTally(),
    val days: Int = ChildHomeworkViewModel.DAYS,
)

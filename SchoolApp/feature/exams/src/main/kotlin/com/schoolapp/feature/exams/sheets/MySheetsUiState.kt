package com.schoolapp.feature.exams.sheets

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.MarkSheet

/** Sheets of one exam, in list order. */
@Immutable
data class ExamSheetGroup(val examId: String, val examName: String, val sheets: List<MarkSheet>)

@Immutable
data class MySheetsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val groups: List<ExamSheetGroup> = emptyList(),
)

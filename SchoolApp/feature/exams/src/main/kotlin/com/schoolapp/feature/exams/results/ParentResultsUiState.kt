package com.schoolapp.feature.exams.results

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.core.model.exams.TrendPoint
import com.schoolapp.core.model.progress.ProgressNote

/** Report card request of one exam: [status] PENDING means "being prepared". */
@Immutable
data class ReportCardUi(val loading: Boolean = false, val status: ReportCardStatus? = null, val error: AppError? = null)

@Immutable
data class ParentResultsUiState(
    val childId: String? = null,
    val childName: String? = null,
    val isLoading: Boolean = true,
    val error: AppError? = null,
    /** Published results, newest first. */
    val results: List<StudentResult> = emptyList(),
    /** Percent per exam, oldest first. */
    val trend: List<TrendPoint> = emptyList(),
    val notes: List<ProgressNote> = emptyList(),
    val reportCards: Map<String, ReportCardUi> = emptyMap(),
    /** One-shot: a ready report card to open in a viewer. */
    val openUrl: String? = null,
)

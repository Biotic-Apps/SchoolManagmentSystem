package com.schoolapp.feature.attendance.supervisor

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.RegisterStatus

@Immutable
data class SectionSummaryRow(
    val sectionId: String,
    val title: String,
    val status: RegisterStatus,
    val present: Int,
    val absent: Int,
    val late: Int,
    val leave: Int,
    val total: Int,
    /** No SUBMITTED register yet (from `/attendance/unmarked`). */
    val notSubmitted: Boolean,
)

@Immutable
data class BranchTotals(
    val present: Int = 0,
    val absent: Int = 0,
    val late: Int = 0,
    val leave: Int = 0,
    /** Students in sections whose marks are missing; never counted as absent. */
    val unmarked: Int = 0,
)

@Immutable
data class BranchTodayUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val date: String = "",
    val today: String = "",
    val rows: List<SectionSummaryRow> = emptyList(),
    val totals: BranchTotals = BranchTotals(),
    val pendingLeaves: Int? = null,
) {
    val notSubmitted: List<SectionSummaryRow> get() = rows.filter { it.notSubmitted }
    val submitted: List<SectionSummaryRow> get() = rows.filterNot { it.notSubmitted }
}

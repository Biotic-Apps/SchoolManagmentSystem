package com.schoolapp.feature.reports.catalog

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.reports.RecentExport
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportArea

@Immutable
data class ReportGroup(val area: ReportArea, val reports: List<Report>)

/** One-off confirmations shown as a toast. */
enum class ReportsMessage { QUEUED, RETRY_QUEUED }

@Immutable
data class ReportsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val groups: List<ReportGroup> = emptyList(),
    val recent: List<RecentExport> = emptyList(),
    /** Report whose filter sheet is open. */
    val selected: Report? = null,
    /** Job ids being re-queued after a failure. */
    val retrying: Set<String> = emptySet(),
    val actionError: AppError? = null,
    val message: ReportsMessage? = null,
    val openUrl: String? = null,
)

internal fun List<Report>.groupByArea(): List<ReportGroup> =
    ReportArea.entries.mapNotNull { area ->
        filter { it.area == area }.takeIf { it.isNotEmpty() }?.let { ReportGroup(area, it) }
    }

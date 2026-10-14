package com.schoolapp.feature.reports.catalog

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.reports.R
import com.schoolapp.feature.reports.components.RecentExportActions
import com.schoolapp.feature.reports.components.RecentExportsCard
import com.schoolapp.feature.reports.components.ReportCard
import com.schoolapp.feature.reports.components.areaLabel

internal data class ReportsCallbacks(
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onSelect: (Report) -> Unit,
    val onClearRecent: () -> Unit,
    val onDismissError: () -> Unit,
    val recent: RecentExportActions,
)

@Composable
internal fun ReportsScreen(state: ReportsUiState, callbacks: ReportsCallbacks, modifier: Modifier = Modifier) {
    val error = state.error
    when {
        state.isLoading && state.groups.isEmpty() -> LoadingState(modifier)
        error != null && state.groups.isEmpty() -> ErrorState(appErrorMessage(error), modifier, onRetry = callbacks.onRetry)
        else -> RefreshBox(state.isRefreshing, callbacks.onRefresh, modifier) {
            ScreenColumn {
                item(key = "header") {
                    Text(stringResource(R.string.reports_subtitle), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
                state.actionError?.let { actionError ->
                    item(key = "action_error") { InlineMessage(appErrorMessage(actionError), StatusTone.Error) }
                }
                if (state.recent.isNotEmpty()) {
                    item(key = "recent") {
                        RecentExportsCard(state.recent, state.retrying, callbacks.recent, onClear = callbacks.onClearRecent)
                    }
                }
                if (state.groups.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.reports_empty_title),
                            message = stringResource(R.string.reports_empty_message),
                            icon = Icons.Outlined.BarChart,
                        )
                    }
                }
                state.groups.forEach { group ->
                    item(key = "area_${group.area.name}") { SectionHeader(title = areaLabel(group.area)) }
                    group.reports.forEach { report ->
                        item(key = "report_${report.key}") { ReportCard(report, onClick = { callbacks.onSelect(report) }) }
                    }
                }
            }
        }
    }
}

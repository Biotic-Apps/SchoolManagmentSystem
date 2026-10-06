package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.dashboard.components.MetricGrid
import com.schoolapp.feature.dashboard.components.SummaryHeader
import com.schoolapp.feature.dashboard.components.TodayPeriodsCard
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.dashboard.components.WelcomeCard

@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onRefresh: () -> Unit,
    onOpenMenu: (String) -> Unit,
    modifier: Modifier = Modifier,
    canOpenMenu: (String) -> Boolean = { true },
) {
    when (state) {
        DashboardUiState.Loading -> LoadingState(modifier)
        is DashboardUiState.Error -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRefresh)
        is DashboardUiState.Welcome -> ScreenColumn(modifier) {
            item(key = "welcome") { WelcomeCard(state) }
            state.todayPeriods?.let { periods ->
                item(key = "today") {
                    TodayPeriodsCard(
                        periods = periods,
                        onOpenTimetable = MenuIds.TIMETABLE.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
                    )
                }
            }
        }
        is DashboardUiState.Summary -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            MetricGrid(
                metrics = state.metrics,
                onOpenMenu = onOpenMenu,
                canOpenMenu = canOpenMenu,
                header = { SummaryHeader(state.userName, state.scopeName) },
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun DashboardSummaryPreview() = SchoolTheme {
    DashboardScreen(
        state = DashboardUiState.Summary(
            userName = "Sara Ali",
            scopeName = "Main Branch",
            metrics = listOf(
                DashboardMetric("branches", 3), DashboardMetric("users", 42),
                DashboardMetric("sections", 18), DashboardMetric("pendingApprovals", 5),
            ),
        ),
        onRefresh = {}, onOpenMenu = {},
    )
}

@Preview(showBackground = true)
@Composable
private fun DashboardWelcomePreview() = SchoolTheme {
    DashboardScreen(
        state = DashboardUiState.Welcome("Sara Ali", RoleKey.TEACHER, null, "Main Branch", "Bright School"),
        onRefresh = {}, onOpenMenu = {},
    )
}

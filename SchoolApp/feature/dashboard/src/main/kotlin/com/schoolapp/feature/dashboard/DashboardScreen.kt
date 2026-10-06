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
import com.schoolapp.feature.dashboard.components.ParentHomeContent
import com.schoolapp.feature.dashboard.components.SupervisorGrid
import com.schoolapp.feature.dashboard.components.TeacherTodayContent
import com.schoolapp.feature.dashboard.components.WelcomeCard
import com.schoolapp.feature.dashboard.supervisor.pendingTiles

@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onRefresh: () -> Unit,
    onOpenMenu: (String) -> Unit,
    modifier: Modifier = Modifier,
    onOpen: (Any) -> Unit = {},
    canOpenMenu: (String) -> Boolean = { true },
) {
    when (state) {
        DashboardUiState.Loading -> LoadingState(modifier)
        is DashboardUiState.Error -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRefresh)
        is DashboardUiState.Welcome -> ScreenColumn(modifier) { item(key = "welcome") { WelcomeCard(state) } }
        is DashboardUiState.Supervisor -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            SupervisorGrid(state, onOpenMenu, onOpen, canOpenMenu)
        }
        is DashboardUiState.Teacher -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            TeacherTodayContent(state, onOpenMenu, onOpen, canOpenMenu)
        }
        is DashboardUiState.Parent -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            ParentHomeContent(state, onRefresh, onOpenMenu, onOpen, canOpenMenu)
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun DashboardSupervisorPreview() = SchoolTheme {
    DashboardScreen(
        state = DashboardUiState.Supervisor(
            userName = "Sara Ali",
            scopeName = "Main Branch",
            date = "2026-10-06",
            showsToday = true,
            tiles = pendingTiles(listOf(DashboardMetric("unmarkedAttendance", 2), DashboardMetric("pendingLeave", 0))),
            metrics = listOf(DashboardMetric("students", 420), DashboardMetric("staff", 31)),
        ),
        onRefresh = {}, onOpenMenu = {},
    )
}

@Preview(showBackground = true)
@Composable
private fun DashboardWelcomePreview() = SchoolTheme {
    DashboardScreen(
        state = DashboardUiState.Welcome("Sara Ali", RoleKey.ACCOUNTANT, null, "Main Branch", "Bright School"),
        onRefresh = {}, onOpenMenu = {},
    )
}

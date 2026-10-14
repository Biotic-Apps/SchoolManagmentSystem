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
import com.schoolapp.feature.dashboard.components.FinanceCard
import com.schoolapp.feature.dashboard.parent.ChallanState
import com.schoolapp.feature.dashboard.parent.components.ParentChallan
import com.schoolapp.feature.dashboard.parent.components.ParentHomeContent
import com.schoolapp.feature.dashboard.components.financeAction
import com.schoolapp.feature.dashboard.components.SupervisorGrid
import com.schoolapp.feature.dashboard.components.TeacherTodayContent
import com.schoolapp.feature.dashboard.components.WelcomeCard
import com.schoolapp.feature.dashboard.supervisor.pendingTiles
import com.schoolapp.feature.dashboard.scope.DashboardScopeBar
import com.schoolapp.feature.dashboard.scope.DashboardScopeState
import com.schoolapp.feature.dashboard.scope.ScopeActions

@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onRefresh: () -> Unit,
    onOpenMenu: (String) -> Unit,
    modifier: Modifier = Modifier,
    onOpen: (Any) -> Unit = {},
    canOpenMenu: (String) -> Boolean = { true },
    challan: ChallanState = ChallanState(),
    onDownloadChallan: (String) -> Unit = {},
    scope: DashboardScopeState = DashboardScopeState(),
    scopeActions: ScopeActions = ScopeActions(),
) {
    when (state) {
        DashboardUiState.Loading -> LoadingState(modifier)
        is DashboardUiState.Error -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRefresh)
        is DashboardUiState.Welcome -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            ScreenColumn {
                item(key = "welcome") { WelcomeCard(state) }
                state.finance?.let { finance ->
                    item(key = "finance") { FinanceCard(finance, onClick = financeAction(onOpenMenu, canOpenMenu)) }
                }
            }
        }
        is DashboardUiState.Supervisor -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            SupervisorGrid(
                state,
                onOpenMenu,
                onOpen,
                canOpenMenu,
                scopeBar = if (scope.showPicker) {
                    {
                        DashboardScopeBar(scope, scopeActions.onSchool, scopeActions.onBranch, scopeActions.onSession, scopeActions.onReset)
                    }
                } else {
                    null
                },
            )
        }
        is DashboardUiState.Teacher -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            TeacherTodayContent(state, onOpenMenu, onOpen, canOpenMenu)
        }
        is DashboardUiState.Parent -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            ParentHomeContent(state, onRefresh, onOpenMenu, onOpen, canOpenMenu, ParentChallan(challan, onDownloadChallan))
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

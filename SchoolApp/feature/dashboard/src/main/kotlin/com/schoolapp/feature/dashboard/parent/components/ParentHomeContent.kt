package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.navigation.ActivitiesDestination
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.navigation.NoticesDestination
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.fileJobMessage
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.parent.parentActions

/**
 * Parent "Home" for the active child: profile card, KPI tiles, quick actions, today's classes, recent diary,
 * then notices beside meetings & events on wide windows. Skeleton while the first load runs.
 */
@Composable
internal fun ParentHomeContent(
    state: DashboardUiState.Parent,
    onRetry: () -> Unit,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    challan: ParentChallan,
    modifier: Modifier = Modifier,
) {
    val child = state.child
    if (child == null) {
        EmptyState(
            title = stringResource(R.string.dashboard_no_child_title),
            message = stringResource(R.string.dashboard_no_child_message),
            modifier = modifier,
        )
        return
    }
    val home = state.home
    val nav = ParentNav(onOpenMenu, onOpen, canOpenMenu)
    ScreenColumn(modifier) {
        item(key = "child") { ChildProfileCard(child, home?.child) }
        when {
            home == null && state.isLoading -> item(key = "skeleton") { ParentHomeSkeleton() }
            home == null -> item(key = "error") {
                ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = onRetry)
            }
            else -> {
                state.error?.let { error -> item(key = "inline-error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                homeSections(home, nav, challan)
            }
        }
    }
}

private class ParentNav(
    val onOpenMenu: (String) -> Unit,
    val onOpen: (Any) -> Unit,
    val canOpenMenu: (String) -> Boolean,
) {
    fun menu(id: String): (() -> Unit)? = if (canOpenMenu(id)) ({ onOpenMenu(id) }) else null
}

private fun LazyListScope.homeSections(home: ParentHome, nav: ParentNav, challan: ParentChallan) {
    item(key = "kpis") { ParentKpiGrid(home, nav.onOpenMenu, nav.onOpen, nav.canOpenMenu, challan) }
    challan.state.error?.let { error -> item(key = "challan-error") { InlineMessage(fileJobMessage(error), StatusTone.Error) } }
    if (home.consentsPending > 0) {
        item(key = "consents") { ConsentsCard(home.consentsPending, onOpen = { nav.onOpen(ActivitiesDestination) }) }
    }
    item(key = "actions") {
        ParentQuickActions(parentActions(home.fees, nav.canOpenMenu), nav.onOpenMenu, nav.onOpen, nav.canOpenMenu)
    }
    item(key = "classes") { TodayClassesStrip(home.periods, nav.menu(MenuIds.TIMETABLE)) }
    item(key = "diary") { RecentDiaryCard(home.diary, nav.menu(MenuIds.DIARY)) }
    item(key = "notices-agenda") {
        AdaptivePair(
            first = { ParentNoticesCard(home.notices, onOpenAll = { nav.onOpen(NoticesDestination) }, modifier = it) },
            second = { UpcomingAgendaCard(home.meetings, home.events, nav.menu(MenuIds.MEETINGS), modifier = it) },
        )
    }
}

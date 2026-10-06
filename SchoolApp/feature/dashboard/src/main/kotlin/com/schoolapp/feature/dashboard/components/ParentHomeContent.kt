package com.schoolapp.feature.dashboard.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.navigation.ActivitiesDestination
import com.schoolapp.core.navigation.HealthCardDestination
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.navigation.NoticesDestination
import com.schoolapp.core.navigation.PickupDestination
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.R

/** Parent "Home" for the active child. */
@Composable
internal fun ParentHomeContent(
    state: DashboardUiState.Parent,
    onRetry: () -> Unit,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
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
    val menu = { id: String -> id.takeIf(canOpenMenu)?.let { { onOpenMenu(it) } } }
    ScreenColumn(modifier) {
        item(key = "child") { ChildHeaderCard(child, home?.attendance, showAttendance = home != null) }
        when {
            home == null && state.isLoading -> item(key = "loading") { LoadingState() }
            home == null -> item(key = "error") {
                ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = onRetry)
            }
            else -> {
                state.error?.let { error -> item(key = "inline-error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                item(key = "diary") { ChildDiaryCard(home.diary, menu(MenuIds.DIARY)) }
                item(key = "notices") { ChildNoticesCard(home.notices, onOpenAll = { onOpen(NoticesDestination) }) }
                item(key = "consents") { ConsentsCard(home.consentsPending, onOpen = { onOpen(ActivitiesDestination) }) }
                item(key = "meeting") { NextMeetingCard(home.nextMeeting, menu(MenuIds.MEETINGS)) }
            }
        }
        item(key = "links") {
            QuickLinksRow(
                onHealth = { onOpen(HealthCardDestination()) },
                onPickup = { onOpen(PickupDestination) },
                onRequestLeave = menu(MenuIds.ATTENDANCE),
            )
        }
    }
}

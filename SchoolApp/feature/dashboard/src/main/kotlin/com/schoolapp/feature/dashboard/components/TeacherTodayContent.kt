package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.material.icons.outlined.ReportProblem
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.greetingName
import com.schoolapp.feature.dashboard.teacher.TeacherDay
import com.schoolapp.feature.dashboard.teacher.TeacherSetup

/**
 * Teacher/helper "Today": periods (Now/Next), registers, diaries and non-zero inbox counters. A teacher
 * without any class gets one onboarding card instead of empty "all done" cards.
 */
@Composable
internal fun TeacherTodayContent(
    state: DashboardUiState.Teacher,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
) {
    val day = state.day
    val openTimetable = MenuIds.TIMETABLE.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } }
    ScreenColumn(modifier) {
        item(key = "header") {
            SectionHeader(title = stringResource(R.string.dashboard_greeting, greetingName(state.userName)), subtitle = state.branchName)
        }
        day.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        if (day.setup == TeacherSetup.NOT_ASSIGNED) {
            item(key = "onboarding") { NotAssignedCard() }
        } else {
            item(key = "periods") {
                TodayPeriodsCard(day.periods, openTimetable, notPublished = day.setup == TeacherSetup.NOT_PUBLISHED)
            }
            if (day.error == null) {
                item(key = "registers") { RegistersCard(day.registers, onOpen) }
                item(key = "diaries") { DiariesPendingCard(day.diariesPending, onOpen, hasDiariesDue = day.hasDiariesDue) }
            }
        }
        if (day.error == null && day.hasInbox) {
            item(key = "counters") { InboxCounters(day, onOpenMenu, canOpenMenu) }
        }
    }
}

private val TeacherDay.hasInbox: Boolean get() = (unreadMessages ?: 0) > 0 || (assignedComplaints ?: 0) > 0

/** Only counters with something waiting are shown. */
@Composable
private fun InboxCounters(day: TeacherDay, onOpenMenu: (String) -> Unit, canOpenMenu: (String) -> Boolean) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        day.unreadMessages?.takeIf { it > 0 }?.let { count ->
            StatCard(
                label = stringResource(R.string.dashboard_unread_messages),
                value = count.toString(),
                icon = Icons.AutoMirrored.Outlined.Chat,
                tone = StatusTone.Info,
                onClick = MenuIds.MESSAGES.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
                modifier = Modifier.weight(1f),
            )
        }
        day.assignedComplaints?.takeIf { it > 0 }?.let { count ->
            StatCard(
                label = stringResource(R.string.dashboard_assigned_complaints),
                value = count.toString(),
                icon = Icons.Outlined.ReportProblem,
                tone = StatusTone.Warning,
                onClick = MenuIds.COMPLAINTS.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
                modifier = Modifier.weight(1f),
            )
        }
    }
}

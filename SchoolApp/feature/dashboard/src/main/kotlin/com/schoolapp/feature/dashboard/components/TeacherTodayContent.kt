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

/** Teacher/helper "Today": periods, registers, diaries to write and the inbox counters. */
@Composable
internal fun TeacherTodayContent(
    state: DashboardUiState.Teacher,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
) {
    val day = state.day
    ScreenColumn(modifier) {
        item(key = "header") {
            SectionHeader(
                title = stringResource(R.string.dashboard_greeting, state.userName.substringBefore(' ')),
                subtitle = state.branchName,
            )
        }
        day.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "periods") {
            TodayPeriodsCard(
                periods = day.periods,
                onOpenTimetable = MenuIds.TIMETABLE.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
            )
        }
        if (day.error == null) {
            item(key = "registers") { RegistersCard(day.registers, onOpen) }
            item(key = "diaries") { DiariesPendingCard(day.diariesPending, onOpen) }
            item(key = "counters") {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(
                        label = stringResource(R.string.dashboard_unread_messages),
                        value = (day.unreadMessages ?: 0).toString(),
                        icon = Icons.AutoMirrored.Outlined.Chat,
                        tone = if ((day.unreadMessages ?: 0) > 0) StatusTone.Info else StatusTone.Neutral,
                        onClick = MenuIds.MESSAGES.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
                        modifier = Modifier.weight(1f),
                    )
                    StatCard(
                        label = stringResource(R.string.dashboard_assigned_complaints),
                        value = (day.assignedComplaints ?: 0).toString(),
                        icon = Icons.Outlined.ReportProblem,
                        tone = if ((day.assignedComplaints ?: 0) > 0) StatusTone.Warning else StatusTone.Neutral,
                        onClick = MenuIds.COMPLAINTS.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

package com.schoolapp.feature.meetings.staff.slots

import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EditCalendar
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.timeRange12
import com.schoolapp.feature.meetings.staff.slots.components.MySlotCard
import com.schoolapp.feature.meetings.staff.slots.components.SlotsWeekHeader

/** Callbacks of the "My slots" tab, its sheet and its remove dialog. */
internal class MySlotsActions(
    val onPreviousWeek: () -> Unit,
    val onNextWeek: () -> Unit,
    val onThisWeek: () -> Unit,
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onAskDelete: (MeetingSlot) -> Unit,
    val onDismissDelete: () -> Unit,
    val onConfirmDelete: () -> Unit,
    val onOpenSheet: () -> Unit,
    val sheet: PublishSlotsActions,
)

/** "My slots" tab body inside the staff meetings list. */
internal fun LazyListScope.mySlotsTab(state: MySlotsUiState, actions: MySlotsActions) {
    item(key = "slots_header") {
        SlotsWeekHeader(
            weekStart = state.weekStart,
            weekEnd = state.weekEnd,
            isThisWeek = state.isThisWeek,
            onPrevious = actions.onPreviousWeek,
            onNext = actions.onNextWeek,
            onThisWeek = actions.onThisWeek,
        )
    }
    state.notice?.let { notice -> item(key = "slots_notice") { InlineMessage(noticeText(notice), StatusTone.Success) } }
    state.actionError?.let { item(key = "slots_action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
    when {
        state.isLoading -> item(key = "slots_loading") { LoadingState() }
        state.error != null -> item(key = "slots_error") { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
        state.days.isEmpty() -> item(key = "slots_empty") {
            EmptyState(
                stringResource(R.string.meetings_no_slots_week),
                message = stringResource(R.string.meetings_no_slots_week_hint),
                icon = Icons.Outlined.EditCalendar,
            )
        }
        else -> state.days.forEach { day ->
            item(key = "slots_day_${day.date}") { SectionHeader(formatDate(day.date).orEmpty()) }
            items(day.slots, key = { "slot_${it.id}" }) { slot ->
                MySlotCard(
                    slot = slot,
                    free = slot.isFree(),
                    deleting = state.deletingId == slot.id,
                    onDelete = { actions.onAskDelete(slot) },
                )
            }
        }
    }
}

/** Sheet and confirm dialog drawn above the list. */
@Composable
internal fun MySlotsOverlays(state: MySlotsUiState, actions: MySlotsActions) {
    state.sheet?.let { PublishSlotsSheet(it, actions.sheet) }
    state.deleteTarget?.let { slot ->
        ConfirmDialog(
            title = stringResource(R.string.meetings_remove_slot_title),
            message = stringResource(R.string.meetings_slot_line, formatDate(slot.date).orEmpty(), timeRange12(slot.startTime, slot.endTime)),
            confirmLabel = stringResource(R.string.meetings_remove_slot_confirm),
            onConfirm = actions.onConfirmDelete,
            onDismiss = actions.onDismissDelete,
            destructive = true,
        )
    }
}

@Composable
private fun noticeText(notice: SlotsNotice): String = when (notice) {
    is SlotsNotice.Published -> pluralStringResource(R.plurals.meetings_slots_published, notice.count, notice.count)
    SlotsNotice.Removed -> stringResource(R.string.meetings_slot_removed)
}

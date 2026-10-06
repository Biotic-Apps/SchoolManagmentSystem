package com.schoolapp.feature.meetings.book

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.book.components.SlotCard

@Composable
internal fun BookMeetingScreen(
    state: BookMeetingUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onSlotSelected: (String) -> Unit,
    onChangeSlot: () -> Unit,
    onAgendaChange: (String) -> Unit,
    onBook: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.meetings_book), subtitle = state.childName, navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        val selected = state.selected
        when {
            state.booked -> ScreenColumn(body) {
                item(key = "booked") { InlineMessage(stringResource(R.string.meetings_booked), StatusTone.Success) }
                item(key = "back") { PrimaryButton(stringResource(R.string.meetings_back_to_meetings), onBack) }
            }
            state.childId == null && !state.isLoading -> EmptyState(stringResource(R.string.meetings_no_child), body)
            selected != null -> ScreenColumn(body) {
                state.bookError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "slot") { SlotCard(selected, selected = true) }
                item(key = "change") { AppTextButton(stringResource(R.string.meetings_change_slot), onChangeSlot, enabled = !state.isBooking) }
                item(key = "agenda") {
                    AppTextArea(
                        value = state.agenda,
                        onValueChange = onAgendaChange,
                        label = stringResource(R.string.meetings_agenda),
                        errorText = stringResource(R.string.meetings_error_agenda).takeIf { state.agendaMissing },
                        supportingText = stringResource(R.string.meetings_agenda_hint),
                        enabled = !state.isBooking,
                    )
                }
                item(key = "book") { PrimaryButton(stringResource(R.string.meetings_confirm_booking), onBook, loading = state.isBooking) }
            }
            state.isLoading -> LoadingState(body)
            state.error != null -> ErrorState(appErrorMessage(state.error), body, onRetry = onRetry)
            else -> ScreenColumn(body) {
                if (state.slotTaken) {
                    item(key = "taken") { InlineMessage(stringResource(R.string.meetings_slot_taken), StatusTone.Warning) }
                }
                if (state.days.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(stringResource(R.string.meetings_no_slots), message = stringResource(R.string.meetings_no_slots_hint), icon = Icons.Outlined.EventBusy)
                    }
                } else {
                    slotDays(state.days, onSlotSelected)
                }
            }
        }
    }
}

private fun LazyListScope.slotDays(days: List<SlotDay>, onSlotSelected: (String) -> Unit) {
    days.forEach { day ->
        item(key = "d_${day.date}") { SectionHeader(formatDate(day.date).orEmpty()) }
        items(day.slots, key = { it.id }) { slot -> SlotCard(slot, onClick = { onSlotSelected(slot.id) }) }
    }
}

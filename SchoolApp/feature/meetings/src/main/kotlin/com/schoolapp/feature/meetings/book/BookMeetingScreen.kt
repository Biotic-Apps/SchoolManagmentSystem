package com.schoolapp.feature.meetings.book

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
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
import com.schoolapp.feature.meetings.book.components.RequestTimeForm
import com.schoolapp.feature.meetings.book.components.SlotCard
import com.schoolapp.feature.meetings.book.components.TeacherCard

@Composable
internal fun BookMeetingScreen(
    state: BookMeetingUiState,
    actions: BookMeetingActions,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.meetings_book),
                subtitle = state.childName,
                navigationIcon = { BackButton(actions.onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val selected = state.selected
        val request = state.request
        when {
            state.booked || state.requested -> ScreenColumn(body) {
                val done = if (state.booked) R.string.meetings_booked else R.string.meetings_request_sent
                item(key = "done") { InlineMessage(stringResource(done), StatusTone.Success) }
                item(key = "back") { PrimaryButton(stringResource(R.string.meetings_back_to_meetings), actions.onBack) }
            }
            state.childId == null && !state.isLoading -> EmptyState(stringResource(R.string.meetings_no_child), body)
            selected != null -> ScreenColumn(body) {
                state.bookError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "slot") { SlotCard(selected, selected = true) }
                item(key = "change") { AppTextButton(stringResource(R.string.meetings_change_slot), actions.onChangeSlot, enabled = !state.isBooking) }
                agendaItems(state, actions, actions.onBook, R.string.meetings_confirm_booking)
            }
            request != null -> ScreenColumn(body) {
                val name = state.teacher?.name.orEmpty()
                val hasSlots = state.days.isNotEmpty()
                state.bookError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "intro") {
                    val intro = if (hasSlots) R.string.meetings_request_intro else R.string.meetings_request_intro_no_slots
                    InlineMessage(stringResource(intro, name), StatusTone.Info)
                }
                item(key = "time") {
                    RequestTimeForm(
                        draft = request,
                        minDate = state.today,
                        enabled = !state.isBooking,
                        onDate = actions.onRequestDate,
                        onTime = actions.onRequestTime,
                        onMode = actions.onRequestMode,
                    )
                }
                agendaItems(state, actions, actions.onSendRequest, R.string.meetings_send_request)
                item(key = "back") {
                    val back = if (hasSlots) R.string.meetings_pick_open_time else R.string.meetings_choose_other_teacher
                    AppTextButton(stringResource(back), actions.onCloseRequest, enabled = !state.isBooking)
                }
            }
            state.isLoading -> LoadingState(body)
            state.error != null -> ErrorState(appErrorMessage(state.error), body, onRetry = actions.onRetry)
            else -> ScreenColumn(body) {
                if (state.slotTaken) {
                    item(key = "taken") { InlineMessage(stringResource(R.string.meetings_slot_taken), StatusTone.Warning) }
                }
                teacherItems(state, actions)
            }
        }
    }
}

private fun LazyListScope.teacherItems(state: BookMeetingUiState, actions: BookMeetingActions) {
    if (state.teachers.isEmpty()) {
        item(key = "no_teachers") { InlineMessage(stringResource(R.string.meetings_no_teachers), StatusTone.Info) }
        return
    }
    item(key = "who") { SectionHeader(stringResource(R.string.meetings_choose_teacher)) }
    items(state.teachers, key = { "t_${it.userId}" }) { teacher ->
        TeacherCard(teacher, selected = teacher.userId == state.teacherId, onClick = { actions.onTeacherSelected(teacher.userId) })
    }
    val teacher = state.teacher
    if (teacher == null) {
        item(key = "hint") { InlineMessage(stringResource(R.string.meetings_choose_teacher_hint), StatusTone.Info) }
        return
    }
    item(key = "times") { SectionHeader(stringResource(R.string.meetings_open_times_with, teacher.name)) }
    slotDays(state.days, actions.onSlotSelected)
    item(key = "suggest") { AppTextButton(stringResource(R.string.meetings_suggest_time), actions.onSuggestTime) }
}

private fun LazyListScope.agendaItems(state: BookMeetingUiState, actions: BookMeetingActions, onSubmit: () -> Unit, submitLabel: Int) {
    item(key = "agenda") {
        AppTextArea(
            value = state.agenda,
            onValueChange = actions.onAgendaChange,
            label = stringResource(R.string.meetings_agenda),
            errorText = stringResource(R.string.meetings_error_agenda).takeIf { state.agendaMissing },
            supportingText = stringResource(R.string.meetings_agenda_hint),
            enabled = !state.isBooking,
        )
    }
    item(key = "submit") { PrimaryButton(stringResource(submitLabel), onSubmit, loading = state.isBooking) }
}

private fun LazyListScope.slotDays(days: List<SlotDay>, onSlotSelected: (String) -> Unit) {
    days.forEach { day ->
        item(key = "d_${day.date}") { SectionHeader(formatDate(day.date).orEmpty()) }
        items(day.slots, key = { it.id }) { slot -> SlotCard(slot, onClick = { onSlotSelected(slot.id) }) }
    }
}

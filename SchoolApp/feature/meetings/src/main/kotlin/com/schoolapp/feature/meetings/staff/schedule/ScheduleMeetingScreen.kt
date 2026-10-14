package com.schoolapp.feature.meetings.staff.schedule

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.imePadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.MeetingTimeFields
import com.schoolapp.feature.meetings.domain.MeetingTimeDraft
import com.schoolapp.feature.meetings.staff.schedule.components.GuardianChooser
import com.schoolapp.feature.meetings.staff.schedule.components.StudentChooser

internal class ScheduleMeetingActions(
    val onQueryChange: (String) -> Unit,
    val onStudentSelected: (StudentSummary) -> Unit,
    val onClearStudent: () -> Unit,
    val onGuardianSelected: (String) -> Unit,
    val onRetryGuardians: () -> Unit,
    val onTimeChange: (MeetingTimeDraft) -> Unit,
    val onAgendaChange: (String) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun ScheduleMeetingScreen(state: ScheduleMeetingUiState, actions: ScheduleMeetingActions, modifier: Modifier = Modifier) {
    val enabled = !state.isSubmitting
    ScreenColumn(modifier.imePadding()) {
        item(key = "intro") { InlineMessage(stringResource(R.string.meetings_schedule_intro), StatusTone.Info) }
        item(key = "student") {
            StudentChooser(
                selected = state.student,
                query = state.query,
                isSearching = state.isSearching,
                results = state.results,
                error = state.searchError,
                missing = state.studentMissing,
                enabled = enabled,
                onQueryChange = actions.onQueryChange,
                onSelect = actions.onStudentSelected,
                onClear = actions.onClearStudent,
            )
        }
        if (state.student != null) {
            item(key = "guardian") {
                GuardianChooser(
                    guardians = state.guardians,
                    selectedGuardianId = state.guardianId,
                    isLoading = state.isLoadingGuardians,
                    error = state.guardiansError,
                    missing = state.guardianMissing,
                    enabled = enabled,
                    onSelect = actions.onGuardianSelected,
                    onRetry = actions.onRetryGuardians,
                )
            }
        }
        item(key = "time") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(stringResource(R.string.meetings_when))
                MeetingTimeFields(state.time, state.timeProblems, minDate = state.today, enabled = enabled, onChange = actions.onTimeChange)
            }
        }
        item(key = "agenda") {
            AppTextArea(
                value = state.agenda,
                onValueChange = actions.onAgendaChange,
                label = stringResource(R.string.meetings_agenda),
                errorText = when (state.agendaError) {
                    AgendaError.MISSING -> stringResource(R.string.meetings_error_agenda)
                    AgendaError.TOO_LONG -> stringResource(R.string.meetings_error_agenda_long)
                    null -> null
                },
                enabled = enabled,
            )
        }
        state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "submit") {
            PrimaryButton(
                text = stringResource(R.string.meetings_schedule_submit),
                onClick = actions.onSubmit,
                loading = state.isSubmitting,
                leadingIcon = Icons.Outlined.CalendarMonth,
            )
        }
    }
}

package com.schoolapp.feature.attendance.child

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.AttendanceSummaryCard
import com.schoolapp.feature.attendance.components.DayRow
import com.schoolapp.feature.attendance.components.MonthCalendar
import com.schoolapp.feature.attendance.components.MonthHeader
import com.schoolapp.feature.attendance.components.label
import com.schoolapp.feature.attendance.leave.LeaveRequestSheet
import com.schoolapp.feature.attendance.leave.MyLeavesState
import com.schoolapp.feature.attendance.leave.myLeavesSection

@Composable
internal fun ChildAttendanceRoute(modifier: Modifier = Modifier, viewModel: ChildAttendanceViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val leaves by viewModel.leavesState.collectAsStateWithLifecycle()
    val controller = viewModel.leaves
    Box(modifier.fillMaxSize()) {
        ChildAttendanceScreen(
            state = state,
            leaves = leaves,
            onPreviousMonth = viewModel::onPreviousMonth,
            onNextMonth = viewModel::onNextMonth,
            onRetry = viewModel::retry,
            onCancelLeave = controller::cancel,
        )
        if (state.childId != null) {
            AppFloatingButton(
                text = stringResource(R.string.attendance_request_leave),
                icon = Icons.Outlined.EventBusy,
                onClick = controller::openForm,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    leaves.form?.let { form ->
        LeaveRequestSheet(
            form = form,
            subtitle = state.childName,
            onTypeChange = controller::onTypeChange,
            onFromChange = controller::onFromChange,
            onToChange = controller::onToChange,
            onReasonChange = controller::onReasonChange,
            onSubmit = controller::submit,
            onDismiss = controller::dismissForm,
        )
    }
}

@Composable
internal fun ChildAttendanceScreen(
    state: ChildAttendanceUiState,
    leaves: MyLeavesState,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onRetry: () -> Unit,
    onCancelLeave: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (state.childId == null && !state.isLoading) {
        EmptyState(
            title = stringResource(R.string.attendance_no_child),
            message = stringResource(R.string.attendance_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        return
    }
    ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
        item(key = "month") { MonthHeader(state.month, state.canGoNext, onPreviousMonth, onNextMonth) }
        val history = state.history
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            history != null -> {
                item(key = "summary") {
                    AttendanceSummaryCard(stringResource(R.string.attendance_month_summary, state.month.label()), history.summary)
                }
                item(key = "calendar") { MonthCalendar(state.month, state.statusByDate, state.today) }
                item(key = "days_header") { SectionHeader(title = stringResource(R.string.attendance_marked_days)) }
                if (state.markedDays.isEmpty()) {
                    item(key = "days_empty") {
                        Text(stringResource(R.string.attendance_no_marks_month), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                    }
                }
                items(state.markedDays, key = { "day_${it.date}" }) { day ->
                    DayRow(day.date, day.status, listOfNotNull(day.remark?.takeIf { it.isNotBlank() }))
                }
            }
        }
        myLeavesSection(leaves, onCancelLeave, onRetry)
    }
}

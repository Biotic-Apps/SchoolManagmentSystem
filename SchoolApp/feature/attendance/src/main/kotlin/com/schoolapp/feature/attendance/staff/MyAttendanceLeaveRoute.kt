package com.schoolapp.feature.attendance.staff

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.EventNote
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.attendance.StaffAttendanceDay
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.AttendanceSummaryCard
import com.schoolapp.feature.attendance.components.DayRow
import com.schoolapp.feature.attendance.components.MonthHeader
import com.schoolapp.feature.attendance.components.label
import com.schoolapp.feature.attendance.leave.AttendanceLeaveHost

/** Staff self-service: own attendance by month, and own leave (summary, filter, request, cancel). */
@Composable
internal fun MyAttendanceLeaveRoute(modifier: Modifier = Modifier, viewModel: MyAttendanceViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val leaves by viewModel.leavesState.collectAsStateWithLifecycle()
    AttendanceLeaveHost(
        leaves = leaves,
        controller = viewModel.leaves,
        childName = null,
        canRequest = true,
        onRetry = viewModel::retry,
        modifier = modifier,
    ) { contentModifier ->
        MyAttendanceContent(state, viewModel::onPreviousMonth, viewModel::onNextMonth, viewModel::retry, contentModifier)
    }
}

@Composable
internal fun MyAttendanceContent(
    state: MyAttendanceUiState,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 96.dp)) {
        item(key = "month") { MonthHeader(state.month, state.canGoNext, onPreviousMonth, onNextMonth) }
        val attendance = state.attendance
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            attendance != null -> {
                attendance.summary?.let { summary ->
                    item(key = "summary") {
                        AttendanceSummaryCard(stringResource(R.string.attendance_my_month_summary, state.month.label()), summary)
                    }
                }
                item(key = "days_header") { SectionHeader(title = stringResource(R.string.attendance_my_days)) }
                val days = attendance.days.sortedByDescending { it.date }
                if (days.isEmpty()) {
                    item(key = "days_empty") {
                        EmptyState(title = stringResource(R.string.attendance_no_marks_month), icon = Icons.AutoMirrored.Outlined.EventNote)
                    }
                }
                items(days, key = { "day_${it.date}" }) { day -> DayRow(day.date, day.status, staffDetails(day)) }
            }
        }
    }
}

@Composable
private fun staffDetails(day: StaffAttendanceDay): List<String> = listOfNotNull(
    formatTime(day.checkIn)?.let { stringResource(R.string.attendance_check_in, it) },
    formatTime(day.checkOut)?.let { stringResource(R.string.attendance_check_out, it) },
    day.remark?.takeIf { it.isNotBlank() },
)

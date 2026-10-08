package com.schoolapp.feature.attendance.supervisor

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.navigation.AttendanceRegisterDestination
import com.schoolapp.core.navigation.LeaveReviewDestination
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.AttendanceDateField
import com.schoolapp.feature.attendance.components.CountItem
import com.schoolapp.feature.attendance.components.CountsGrid
import com.schoolapp.feature.attendance.components.LeaveReviewEntry
import com.schoolapp.feature.attendance.components.attendanceStatusLabel
import com.schoolapp.feature.attendance.supervisor.components.SectionSummaryCard

@Composable
internal fun BranchTodayRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: BranchTodayViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(viewModel) {
        if (resumedOnce) viewModel.refresh()
        resumedOnce = true
        onPauseOrDispose { }
    }
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier.fillMaxSize()) {
        BranchTodayScreen(
            state = state,
            onDateSelected = viewModel::onDateSelected,
            onRetry = viewModel::load,
            onSectionClick = { row -> onOpen(AttendanceRegisterDestination(row.sectionId, state.date, row.title)) },
            onLeaveReview = { onOpen(LeaveReviewDestination) },
        )
    }
}

@Composable
internal fun BranchTodayScreen(
    state: BranchTodayUiState,
    onDateSelected: (String) -> Unit,
    onRetry: () -> Unit,
    onSectionClick: (SectionSummaryRow) -> Unit,
    onLeaveReview: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.rows.isEmpty() -> PullableState(modifier) { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
        else -> ScreenColumn(modifier) {
            state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            item(key = "date") { AttendanceDateField(state.date, state.today, onDateSelected) }
            item(key = "totals") { TotalsCard(state.totals) }
            item(key = "leave") { LeaveReviewEntry(onLeaveReview, pendingCount = state.pendingLeaves) }
            if (state.rows.isEmpty()) {
                item(key = "empty") { EmptyState(stringResource(R.string.attendance_no_sections), icon = Icons.Outlined.Groups) }
            }
            val pending = state.notSubmitted
            if (pending.isNotEmpty()) {
                item(key = "pending_header") { SectionHeader(title = stringResource(R.string.attendance_not_submitted)) }
                item(key = "pending_note") {
                    InlineMessage(pluralStringResource(R.plurals.attendance_sections_not_submitted, pending.size, pending.size), StatusTone.Warning)
                }
                items(pending, key = { "p_${it.sectionId}" }) { row -> SectionSummaryCard(row, onClick = { onSectionClick(row) }) }
            }
            val done = state.submitted
            if (done.isNotEmpty()) {
                item(key = "done_header") { SectionHeader(title = stringResource(R.string.attendance_submitted_sections)) }
                items(done, key = { "d_${it.sectionId}" }) { row -> SectionSummaryCard(row, onClick = { onSectionClick(row) }) }
            }
        }
    }
}

@Composable
private fun TotalsCard(totals: BranchTotals) {
    AppCard(contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(R.string.attendance_branch_totals), style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
            CountsGrid(
                listOf(
                    CountItem(attendanceStatusLabel(AttendanceStatus.PRESENT), totals.present, StatusTone.Success),
                    CountItem(attendanceStatusLabel(AttendanceStatus.ABSENT), totals.absent, StatusTone.Error),
                    CountItem(attendanceStatusLabel(AttendanceStatus.LATE), totals.late, StatusTone.Warning),
                    CountItem(attendanceStatusLabel(AttendanceStatus.LEAVE), totals.leave, StatusTone.Info),
                    CountItem(attendanceStatusLabel(null), totals.unmarked, StatusTone.Neutral),
                ),
            )
        }
    }
}

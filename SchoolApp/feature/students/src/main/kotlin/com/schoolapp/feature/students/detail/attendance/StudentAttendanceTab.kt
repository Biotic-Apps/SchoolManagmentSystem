package com.schoolapp.feature.students.detail.attendance

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.students.R

/** Attendance tab (web StudentAttendanceTab): month summary and a colour-coded calendar. */
@Composable
internal fun StudentAttendanceTab(studentId: String, modifier: Modifier = Modifier) {
    val viewModel: StudentAttendanceViewModel = hiltViewModel()
    LaunchedEffect(studentId) { viewModel.start(studentId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier.fillMaxSize()) {
        ScreenColumn {
            item(key = "month") {
                AttendanceMonthHeader(state.month, state.canGoNext, viewModel::onPreviousMonth, viewModel::onNextMonth)
            }
            val history = state.history
            val error = state.error
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                error != null && history == null -> item(key = "error") {
                    ErrorState(loadErrorMessage(error), onRetry = { viewModel.load() })
                }
                history != null -> {
                    item(key = "summary") { AttendanceSummaryCard(history.summary) }
                    item(key = "calendar") {
                        AttendanceMonthCalendar(state.month, history.days.associate { it.date to it.status }, state.today)
                    }
                    if (history.days.isEmpty()) {
                        item(key = "empty") {
                            EmptyState(
                                title = stringResource(R.string.sd_att_empty_title),
                                message = stringResource(R.string.sd_att_empty_message),
                                icon = Icons.Outlined.EventBusy,
                            )
                        }
                    }
                }
            }
        }
    }
}

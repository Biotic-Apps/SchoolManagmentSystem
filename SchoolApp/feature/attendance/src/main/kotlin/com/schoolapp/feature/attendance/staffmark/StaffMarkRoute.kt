package com.schoolapp.feature.attendance.staffmark

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.feature.attendance.staffmark.components.StaffDetailsActions
import com.schoolapp.feature.attendance.staffmark.components.StaffDetailsSheet
import com.schoolapp.feature.attendance.staffmark.components.StaffSaveBar

/** Supervisor "Staff" tab: mark the branch's staff for a day and save. */
@Composable
internal fun StaffMarkRoute(modifier: Modifier = Modifier, viewModel: StaffMarkViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(viewModel) { viewModel.start() }
    val actions = remember(viewModel) {
        StaffMarkActions(
            onRetry = viewModel::retry,
            onBranchSelected = viewModel::onBranchSelected,
            onDateSelected = viewModel::onDateSelected,
            onStatusSelected = viewModel::onStatusSelected,
            onMarkAllPresent = viewModel::markAllPresent,
            onEditDetails = viewModel::openDetails,
        )
    }
    Column(modifier.fillMaxSize()) {
        Box(Modifier.weight(1f).fillMaxWidth()) {
            RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
                StaffMarkScreen(state, actions)
            }
        }
        if (!state.isLoading && state.rows.isNotEmpty()) {
            StaffSaveBar(state.dirty, state.isSaving, viewModel::save)
        }
    }
    state.details?.let { row ->
        StaffDetailsSheet(
            row = row,
            actions = StaffDetailsActions(
                onCheckIn = { viewModel.onCheckInChange(row.staffId, it) },
                onCheckOut = { viewModel.onCheckOutChange(row.staffId, it) },
                onClearTimes = { viewModel.clearTimes(row.staffId) },
                onRemark = { viewModel.onRemarkChange(row.staffId, it) },
                onDone = viewModel::closeDetails,
            ),
        )
    }
}

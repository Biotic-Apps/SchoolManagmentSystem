package com.schoolapp.feature.staff.assignments

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.OptionPickerField

/** Assignments of one session with add / end, like the web staff "Assignments" tab. */
@Composable
internal fun StaffAssignmentsTab(
    branchId: String?,
    canEdit: Boolean,
    snackbar: SnackbarHostState,
    modifier: Modifier = Modifier,
    viewModel: AssignmentsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(branchId) { viewModel.bind(branchId) }
    val added = stringResource(R.string.staff_asg_added)
    val ended = stringResource(R.string.staff_asg_ended)
    LaunchedEffect(state.notice) {
        val notice = state.notice ?: return@LaunchedEffect
        viewModel.consumeNotice()
        snackbar.showSnackbar(if (notice == AssignmentNotice.ADDED) added else ended)
    }
    val canAdd = canEdit && branchId != null && state.sessionId != null
    when {
        state.isLoading && state.assignments.isEmpty() -> LoadingState(modifier.fillMaxSize())
        state.error != null -> ErrorState(appErrorMessage(state.error!!), modifier.fillMaxSize(), onRetry = viewModel::retry)
        !state.hasSessions -> EmptyState(
            title = stringResource(R.string.staff_asg_no_sessions),
            message = stringResource(R.string.staff_asg_no_sessions_hint),
            icon = Icons.Outlined.EventBusy,
            modifier = modifier.fillMaxSize(),
        )
        else -> Box(modifier.fillMaxSize()) {
            RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
                ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (canAdd) 88.dp else 16.dp)) {
                    item(key = "session") {
                        OptionPickerField(
                            label = stringResource(R.string.staff_asg_session),
                            options = state.sessions,
                            selectedId = state.sessionId,
                            onSelect = viewModel::selectSession,
                        )
                    }
                    if (state.assignments.isEmpty()) {
                        item(key = "empty") {
                            EmptyState(
                                title = stringResource(R.string.staff_asg_empty),
                                message = stringResource(R.string.staff_asg_empty_hint),
                            )
                        }
                    }
                    items(state.assignments.size, key = { state.assignments[it].id }) { i ->
                        val a = state.assignments[i]
                        AssignmentRow(a, onEnd = { viewModel.askEnd(a) }.takeIf { canEdit })
                    }
                }
            }
            if (canAdd) {
                AppFloatingButton(
                    text = stringResource(R.string.staff_asg_add_title),
                    icon = Icons.Outlined.Add,
                    onClick = viewModel::openAdd,
                    modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
                )
            }
        }
    }
    state.add?.let { AddAssignmentSheet(it, state.sessions, viewModel.addController) }
    state.endTarget?.let { target ->
        ConfirmDialog(
            title = stringResource(R.string.staff_asg_end_title, humanizeKey(target.kind).lowercase()),
            message = state.endError?.let { appErrorMessage(it) } ?: stringResource(R.string.staff_asg_end_message),
            confirmLabel = stringResource(R.string.staff_asg_end),
            onConfirm = viewModel::confirmEnd,
            onDismiss = viewModel::dismissEnd,
            destructive = true,
        )
    }
}

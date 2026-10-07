package com.schoolapp.feature.complaints.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.detail.components.AssignSheet
import com.schoolapp.feature.complaints.detail.components.ReasonSheet
import com.schoolapp.feature.complaints.detail.components.UpdateSheet

@Composable
fun ComplaintDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ComplaintDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.detail?.complaint?.ticketNo ?: stringResource(R.string.complaints_detail_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        ComplaintDetailScreen(
            state = state,
            onRetry = viewModel::load,
            onAddUpdate = viewModel::onAddUpdate,
            onReasonAction = viewModel::onReasonAction,
            onAssign = viewModel::onAssign,
            modifier = Modifier.padding(padding),
        )
    }
    state.updateEditor?.let { editor ->
        UpdateSheet(
            editor = editor,
            onMessageChange = viewModel::onUpdateMessageChange,
            onStatusChange = viewModel::onUpdateStatusChange,
            onAttach = viewModel::onUpdateAttach,
            onRemoveAttachment = viewModel::onUpdateRemoveAttachment,
            onSave = viewModel::saveUpdate,
            onDismiss = viewModel::onDismissSheet,
        )
    }
    state.reasonEditor?.let { editor ->
        ReasonSheet(
            editor = editor,
            onReasonChange = viewModel::onReasonChange,
            onSave = viewModel::saveReason,
            onDismiss = viewModel::onDismissSheet,
        )
    }
    state.assignEditor?.let { editor ->
        AssignSheet(
            editor = editor,
            onQueryChange = viewModel::onAssigneeQueryChange,
            onSelect = viewModel::onAssigneeSelected,
            onRetry = viewModel::loadAssignees,
            onSave = viewModel::saveAssign,
            onDismiss = viewModel::onDismissSheet,
        )
    }
}

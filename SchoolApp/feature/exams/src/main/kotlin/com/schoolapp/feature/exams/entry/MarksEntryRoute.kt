package com.schoolapp.feature.exams.entry

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.markSheetStatusLabel
import com.schoolapp.feature.exams.components.tone
import com.schoolapp.feature.exams.entry.components.MarksBottomBar

@Composable
internal fun MarksEntryRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MarksEntryViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel) {
        MarksEntryActions(
            onRetry = viewModel::load,
            onMarksChange = viewModel::onMarksChange,
            onAbsentChange = viewModel::onAbsentChange,
            onDiscardLocal = viewModel::discardLocal,
            onScrollHandled = viewModel::onScrollHandled,
        )
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title.ifBlank { state.sheet?.title ?: stringResource(R.string.exams_marks_title) },
                subtitle = state.sheet?.examName,
                navigationIcon = { BackButton(onBack) },
                actions = {
                    if (state.sheet != null) StatusChip(markSheetStatusLabel(state.status), state.status.tone(), Modifier.padding(end = 16.dp))
                },
            )
        },
        bottomBar = {
            if (!state.isLoading && state.sheet?.rows?.isNotEmpty() == true && !state.isReadOnly) {
                MarksBottomBar(state.canSubmit, state.busyAction, viewModel::saveDraft, viewModel::onSubmitClick)
            }
        },
    ) { padding ->
        MarksEntryScreen(state, actions, Modifier.padding(padding))
    }
    if (state.confirmSubmit) {
        val counts = state.counts
        ConfirmDialog(
            title = stringResource(R.string.exams_confirm_submit_title),
            message = stringResource(R.string.exams_confirm_submit_message, counts.entered, counts.absent),
            confirmLabel = stringResource(R.string.exams_submit),
            onConfirm = viewModel::onConfirmSubmit,
            onDismiss = viewModel::onDismissConfirm,
        )
    }
}

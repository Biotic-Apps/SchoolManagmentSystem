package com.schoolapp.feature.diary.editor

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.diary.R

@Composable
internal fun DiaryEditorRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DiaryEditorViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { viewModel.onFilePicked(it.toString()) }
    }
    LaunchedEffect(state.result) {
        if (state.result != null) onBack()
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title ?: stringResource(R.string.diary_editor_title),
                subtitle = formatDate(state.date),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(contentModifier)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), contentModifier, onRetry = viewModel::load)
            else -> DiaryEditorContent(
                state = state,
                actions = DiaryEditorActions(
                    onSubjectSelected = viewModel::onSubjectSelected,
                    onTopicsChange = viewModel::onTopicsChange,
                    onHomeworkChange = viewModel::onHomeworkChange,
                    onDueDateChange = viewModel::onDueDateChange,
                    onAddFile = { picker.launch("*/*") },
                    onOpenFile = { id -> state.attachments.firstOrNull { it.id == id }?.url?.let(external::open) },
                    onRemoveFile = viewModel::onRemoveAttachment,
                    onSaveDraft = viewModel::saveDraft,
                    onPublish = viewModel::publish,
                ),
                modifier = contentModifier,
            )
        }
    }
}

package com.schoolapp.feature.notices.compose

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
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
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.feature.notices.R

@Composable
internal fun NoticeComposeRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NoticeComposeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.result) {
        if (state.result != null) onBack()
    }
    val title = if (state.editingId != null && !state.draftMissing) R.string.notices_edit_draft else R.string.notices_new
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        if (state.draftMissing) {
            EmptyState(stringResource(R.string.notices_not_found), Modifier.padding(padding), icon = Icons.Outlined.Campaign)
        } else {
            NoticeComposeForm(
                state = state,
                actions = NoticeComposeActions(
                    onTitleChange = viewModel::onTitleChange,
                    onBodyChange = viewModel::onBodyChange,
                    onAudienceChange = viewModel::onAudienceChange,
                    onRetryOptions = viewModel::loadOptions,
                    onAttach = viewModel::onAttach,
                    onRemoveAttachment = viewModel::onRemoveAttachment,
                    onExpiresOnChange = viewModel::onExpiresOnChange,
                    onPinnedChange = viewModel::onPinnedChange,
                    onSaveDraft = viewModel::saveDraft,
                    onPublish = viewModel::publish,
                ),
                modifier = Modifier.padding(padding),
            )
        }
    }
}

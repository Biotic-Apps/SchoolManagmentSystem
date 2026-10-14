package com.schoolapp.feature.notices.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notices.R

@Composable
internal fun NoticeDetailRoute(
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NoticeDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.notices_detail_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        val notice = state.notice
        when {
            state.isLoading -> LoadingState(contentModifier)
            state.error != null -> ErrorState(appErrorMessage(state.error!!), contentModifier, onRetry = viewModel::load)
            notice == null -> EmptyState(stringResource(R.string.notices_not_found), contentModifier, icon = Icons.Outlined.Campaign)
            else -> NoticeDetailContent(
                state = state,
                notice = notice,
                onEdit = { onEdit(notice.id) },
                onPublish = viewModel::askPublish,
                onRetryReads = viewModel::loadReads,
                modifier = contentModifier,
            )
        }
    }
    if (state.confirmPublish) {
        ConfirmDialog(
            title = stringResource(R.string.notices_publish_confirm_title),
            message = stringResource(R.string.notices_publish_confirm_message),
            confirmLabel = stringResource(R.string.notices_publish),
            onConfirm = viewModel::publish,
            onDismiss = viewModel::dismissPublish,
        )
    }
}

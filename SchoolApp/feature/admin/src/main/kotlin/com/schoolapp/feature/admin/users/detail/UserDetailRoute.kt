package com.schoolapp.feature.admin.users.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.NoticeSnackbarEffect

@Composable
internal fun UserDetailRoute(
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onAssignRole: (String, String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: UserDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val notice by viewModel.notice.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    NoticeSnackbarEffect(notice, snackbar, viewModel::consumeNotice)
    val detail = state.detail
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(title = detail?.user?.name ?: stringResource(R.string.users_detail_title), navigationIcon = { BackButton(onBack) })
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            detail != null -> UserDetailContent(
                state = state,
                actions = UserDetailActions(
                    onEdit = { onEdit(detail.user.id) },
                    onAssignRole = { onAssignRole(detail.user.id, detail.user.name) },
                    onAsk = viewModel::ask,
                    onRefresh = viewModel::refresh,
                ),
                modifier = body,
            )
            state.isLoading -> LoadingState(body)
            else -> ErrorState(state.error?.let { loadErrorMessage(it) }.orEmpty(), body, onRetry = viewModel::retry)
        }
    }
    UserDetailDialogs(state, onConfirm = viewModel::confirm, onDismiss = viewModel::dismissConfirm, onPasswordDone = viewModel::dismissPassword)
}

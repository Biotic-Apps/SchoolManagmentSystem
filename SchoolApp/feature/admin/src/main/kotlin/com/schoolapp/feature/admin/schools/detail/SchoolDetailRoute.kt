package com.schoolapp.feature.admin.schools.detail

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
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.NoticeSnackbarEffect

@Composable
internal fun SchoolDetailRoute(
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SchoolDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val notice by viewModel.notice.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    NoticeSnackbarEffect(notice, snackbar, viewModel::consumeNotice)
    val school = state.school
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = school?.name ?: stringResource(R.string.schools_detail_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            school != null -> SchoolDetailContent(
                state = state,
                actions = SchoolDetailActions(
                    onEdit = { onEdit(school.id) },
                    onToggleStatus = viewModel::onToggleStatus,
                    onDelete = { onDelete(school.id) },
                    onRefresh = viewModel::refresh,
                ),
                modifier = body,
            )
            state.isLoading -> LoadingState(body)
            else -> ErrorState(state.error?.let { loadErrorMessage(it) }.orEmpty(), body, onRetry = viewModel::retry)
        }
    }
    if (state.confirmingStatus && school != null) {
        val archiving = school.isActive
        ConfirmDialog(
            title = stringResource(if (archiving) R.string.schools_archive_title else R.string.schools_restore_title, school.name),
            message = stringResource(if (archiving) R.string.schools_archive_message else R.string.schools_restore_message),
            confirmLabel = stringResource(if (archiving) R.string.schools_archive else R.string.schools_restore),
            onConfirm = viewModel::confirmStatus,
            onDismiss = viewModel::onDismissStatus,
            destructive = archiving,
        )
    }
}

package com.schoolapp.feature.staff.idcard

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleStartEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.staff.R

/** Staff profile "ID card" tab (web StaffIdCardPanel); [canGenerate] = session has `staff.edit`. */
@Composable
fun StaffIdCardTab(canGenerate: Boolean, modifier: Modifier = Modifier) {
    val viewModel: StaffIdCardViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val external = rememberExternalActions()
    LifecycleStartEffect(viewModel) {
        viewModel.setVisible(true)
        onStopOrDispose { viewModel.setVisible(false) }
    }
    LaunchedEffect(state.openUrl) {
        state.openUrl?.let {
            external.open(it)
            viewModel.onUrlOpened()
        }
    }
    val queued = stringResource(R.string.staff_idcard_queued)
    val ready = stringResource(R.string.staff_idcard_ready)
    LaunchedEffect(state.notice) {
        val notice = state.notice ?: return@LaunchedEffect
        viewModel.consumeNotice()
        snackbar.showSnackbar(if (notice == IdCardNotice.QUEUED) queued else ready)
    }
    val actionMessage = state.actionError?.let { appErrorMessage(it) }
    LaunchedEffect(actionMessage) {
        actionMessage ?: return@LaunchedEffect
        viewModel.consumeActionError()
        snackbar.showSnackbar(actionMessage)
    }
    Box(modifier.fillMaxSize()) {
        if (state.isLoading) {
            LoadingState(Modifier.fillMaxSize())
        } else {
            RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
                val error = state.error
                val card = state.card
                when {
                    error != null -> PullableState { ErrorState(loadErrorMessage(error), onRetry = viewModel::retry) }
                    card == null -> PullableState { IdCardEmpty(canGenerate, state.isGenerating, viewModel::generate) }
                    else -> ScreenColumn {
                        item(key = "card") {
                            IdCardDetails(card, state, canGenerate, viewModel::download, viewModel::generate)
                        }
                    }
                }
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}

@Composable
private fun IdCardEmpty(canGenerate: Boolean, generating: Boolean, onGenerate: () -> Unit) {
    EmptyState(
        title = stringResource(R.string.staff_idcard_empty),
        message = stringResource(if (canGenerate) R.string.staff_idcard_empty_can_generate else R.string.staff_idcard_empty_view_only),
        icon = Icons.Outlined.Badge,
        action = if (canGenerate) {
            {
                PrimaryButton(
                    stringResource(R.string.staff_idcard_generate),
                    onGenerate,
                    loading = generating,
                    leadingIcon = Icons.Outlined.Refresh,
                )
            }
        } else {
            null
        },
    )
}

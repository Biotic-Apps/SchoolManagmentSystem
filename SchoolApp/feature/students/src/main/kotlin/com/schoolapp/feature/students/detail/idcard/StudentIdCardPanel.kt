package com.schoolapp.feature.students.detail.idcard

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleStartEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R

/** Staff "ID card" tab (web IdCardPanel); [canGenerate] = `students.edit`. */
@Composable
internal fun StudentIdCardPanel(studentId: String, canGenerate: Boolean, snackbar: SnackbarHostState, modifier: Modifier = Modifier) {
    val viewModel = idCardViewModel(studentId, snackbar)
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when {
        state.isLoading -> LoadingState(modifier)
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier.fillMaxSize()) {
            val error = state.error
            if (error != null) {
                PullableState { ErrorState(loadErrorMessage(error), onRetry = viewModel::retry) }
            } else {
                ScreenColumn {
                    item(key = "card") { IdCardCard(state, canGenerate, viewModel::download, viewModel::generate) }
                }
            }
        }
    }
}

/** Parent child profile: view and download the child's latest ID card (no generating). Lives inside a list. */
@Composable
internal fun ChildIdCardItem(studentId: String, snackbar: SnackbarHostState? = null) {
    val viewModel = idCardViewModel(studentId, snackbar)
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val error = state.error
    when {
        state.isLoading -> LoadingState(rows = 1)
        error != null -> InlineMessage(loadErrorMessage(error), StatusTone.Error)
        else -> IdCardCard(state, canGenerate = false, onDownload = viewModel::download, onGenerate = {})
    }
}

/** Binds the view model to [studentId], polls while visible, opens downloaded links and shows notices. */
@Composable
private fun idCardViewModel(studentId: String, snackbar: SnackbarHostState?): StudentIdCardViewModel {
    val viewModel: StudentIdCardViewModel = hiltViewModel(key = "student-id-card")
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(studentId) { viewModel.start(studentId) }
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
    val queued = stringResource(R.string.sd_idcard_queued)
    val ready = stringResource(R.string.sd_idcard_ready)
    LaunchedEffect(state.notice) {
        val notice = state.notice ?: return@LaunchedEffect
        viewModel.consumeNotice()
        snackbar?.showSnackbar(if (notice == IdCardNotice.QUEUED) queued else ready)
    }
    return viewModel
}

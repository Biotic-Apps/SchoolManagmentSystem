package com.schoolapp.feature.homework.submissions

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Inbox
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.components.changeMessage

@Composable
internal fun SubmissionsRoute(onBack: () -> Unit, modifier: Modifier = Modifier, viewModel: SubmissionsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val message = state.change?.let { changeMessage(it) }
    LaunchedEffect(message) {
        if (message != null) {
            viewModel.onChangeShown()
            snackbar.showSnackbar(message)
        }
    }
    val defaultNote = stringResource(R.string.homework_return_default)
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = state.title,
                subtitle = stringResource(
                    R.string.homework_submissions_subtitle,
                    state.subjectName,
                    formatDate(state.dueDate).orEmpty(),
                    state.submissions.size,
                ),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        val error = state.error
        when {
            state.isLoading -> LoadingState(contentModifier)
            error != null && state.submissions.isEmpty() -> ErrorState(appErrorMessage(error), contentModifier, onRetry = viewModel::load)
            else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = viewModel::refresh, modifier = contentModifier) {
                ScreenColumn {
                    if (error != null) item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) }
                    if (state.submissions.isEmpty()) {
                        item(key = "empty") {
                            EmptyState(
                                stringResource(R.string.homework_no_submissions),
                                message = stringResource(R.string.homework_no_submissions_message),
                                icon = Icons.Outlined.Inbox,
                            )
                        }
                    }
                    items(state.submissions, key = { it.id }) { submission ->
                        SubmissionCard(
                            submission = submission,
                            maxMarks = state.maxMarks,
                            canReview = state.canReview,
                            onGrade = { viewModel.openGrade(submission) },
                            onReturn = { viewModel.openReturn(submission, defaultNote) },
                        )
                    }
                }
            }
        }
    }
    state.grading?.let { draft ->
        GradeSheet(
            draft = draft,
            maxMarks = state.maxMarks,
            actions = GradeSheetActions(
                onMarks = viewModel::onMarks,
                onGrade = viewModel::onGrade,
                onFeedback = viewModel::onFeedback,
                onSave = viewModel::saveGrade,
                onDismiss = viewModel::closeGrade,
            ),
        )
    }
    state.returning?.let { draft ->
        ReturnSheet(draft, onNote = viewModel::onReturnNote, onConfirm = viewModel::confirmReturn, onDismiss = viewModel::closeReturn)
    }
}

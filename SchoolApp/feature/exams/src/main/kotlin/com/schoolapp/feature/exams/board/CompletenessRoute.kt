package com.schoolapp.feature.exams.board

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Grading
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.MarkSheetDestination
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.SheetReviewDestination

@Composable
internal fun CompletenessRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: CompletenessViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleResumeEffect(viewModel) {
        viewModel.onResume()
        onPauseOrDispose { }
    }
    val error = state.error
    when {
        state.isLoading -> LoadingState(modifier)
        error != null -> ErrorState(appErrorMessage(error), modifier, onRetry = viewModel::load)
        state.exams.isEmpty() -> EmptyState(
            title = stringResource(R.string.exams_no_exams),
            message = stringResource(R.string.exams_no_exams_message),
            modifier = modifier,
            icon = Icons.Outlined.Grading,
        )
        else -> CompletenessScreen(
            state = state,
            actions = CompletenessActions(
                onExamSelected = viewModel::onExamSelected,
                onFilterSelected = viewModel::onFilterSelected,
                onRefresh = viewModel::refresh,
                onRetrySheets = viewModel::refresh,
                onSheetClick = { sheet -> onOpen(destinationFor(sheet, state)) },
            ),
            modifier = modifier,
        )
    }
}

/** Submitted sheets go to review; editable ones open marks entry for proxies with `exams.edit`; others are viewed. */
internal fun destinationFor(sheet: MarkSheet, state: CompletenessUiState): Any = when {
    sheet.status == MarkSheetStatus.SUBMITTED -> SheetReviewDestination(sheet.id, sheet.title)
    state.canEdit && sheet.status.isEditable -> MarkSheetDestination(sheet.id, sheet.title)
    else -> SheetReviewDestination(sheet.id, sheet.title)
}

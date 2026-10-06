package com.schoolapp.feature.exams.sheets

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Grading
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.MarkSheetDestination
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.MarkSheetCard

@Composable
internal fun MySheetsRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MySheetsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleResumeEffect(viewModel) {
        viewModel.onResume()
        onPauseOrDispose { }
    }
    MySheetsScreen(
        state = state,
        onRetry = viewModel::load,
        onRefresh = viewModel::refresh,
        onSheetClick = { sheet -> onOpen(MarkSheetDestination(sheet.id, sheet.title)) },
        modifier = modifier,
    )
}

@Composable
internal fun MySheetsScreen(
    state: MySheetsUiState,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onSheetClick: (MarkSheet) -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.groups.isEmpty() -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        state.groups.isEmpty() -> EmptyState(
            title = stringResource(R.string.exams_my_sheets_empty),
            message = stringResource(R.string.exams_my_sheets_empty_message),
            modifier = modifier,
            icon = Icons.Outlined.Grading,
        )
        else -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            ScreenColumn {
                state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                state.groups.forEach { group ->
                    item(key = "exam_${group.examId}") {
                        SectionHeader(
                            title = group.examName.ifBlank { stringResource(R.string.exams_exam_fallback) },
                            subtitle = pluralStringResource(R.plurals.exams_sheets_count, group.sheets.size, group.sheets.size),
                        )
                    }
                    items(group.sheets, key = { "sheet_${it.id}" }) { sheet ->
                        MarkSheetCard(sheet = sheet, title = sheet.title, onClick = { onSheetClick(sheet) })
                    }
                }
            }
        }
    }
}

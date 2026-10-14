package com.schoolapp.feature.exams.board

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.board.components.CompletenessSummary
import com.schoolapp.feature.exams.components.MarkSheetCard
import com.schoolapp.feature.exams.components.examOptions
import com.schoolapp.feature.exams.components.markSheetStatusLabel

internal class CompletenessActions(
    val onExamSelected: (String) -> Unit,
    val onFilterSelected: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onRetrySheets: () -> Unit,
    val onSheetClick: (MarkSheet) -> Unit,
)

@Composable
internal fun CompletenessScreen(
    state: CompletenessUiState,
    actions: CompletenessActions,
    modifier: Modifier = Modifier,
    showExamPicker: Boolean = true,
) {
    val examChips = examOptions(state.exams)
    val filterOptions = listOf(SwitcherOption(CompletenessViewModel.ALL, stringResource(R.string.exams_filter_all, state.sheets.size))) +
        state.statuses.map { (status, count) -> SwitcherOption(status.name, stringResource(R.string.exams_filter_status, markSheetStatusLabel(status), count)) }
    val groups = state.groups
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn {
            if (showExamPicker) item(key = "exam_picker") {
                Column {
                    SectionHeader(title = stringResource(R.string.exams_completeness_title), subtitle = stringResource(R.string.exams_pick_exam))
                    FilterChipRow(examChips, state.selectedExamId, actions.onExamSelected)
                }
            }
            val sheetsError = state.sheetsError
            when {
                state.sheetsLoading -> item(key = "loading") { LoadingState() }
                sheetsError != null && state.sheets.isEmpty() ->
                    item(key = "error") { ErrorState(appErrorMessage(sheetsError), onRetry = actions.onRetrySheets) }
                state.sheets.isEmpty() -> item(key = "empty") { EmptyState(stringResource(R.string.exams_no_sheets)) }
                else -> {
                    item(key = "summary") { CompletenessSummary(state.counts) }
                    item(key = "filters") { FilterChipRow(filterOptions, state.filter?.name ?: CompletenessViewModel.ALL, actions.onFilterSelected) }
                    groups.forEach { group ->
                        item(key = "section_${group.sectionId}") { SectionHeader(title = group.label) }
                        items(group.sheets, key = { "sheet_${it.id}" }) { sheet ->
                            MarkSheetCard(sheet = sheet, title = sheet.subjectName, onClick = { actions.onSheetClick(sheet) }, showTeacher = true)
                        }
                    }
                    if (groups.isEmpty()) item(key = "filtered_empty") { EmptyState(stringResource(R.string.exams_no_sheets_filter)) }
                }
            }
        }
    }
}

package com.schoolapp.feature.exams.classresults

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.classresults.components.ClassResultRow
import com.schoolapp.feature.exams.components.examOptions

internal class ClassResultsActions(
    val onExamSelected: (String) -> Unit,
    val onSectionSelected: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onStudentClick: (String) -> Unit,
)

@Composable
internal fun ClassResultsScreen(state: ClassResultsUiState, actions: ClassResultsActions, modifier: Modifier = Modifier) {
    val examChips = examOptions(state.exams)
    val sectionChips = state.sections.map { SwitcherOption(it.id, it.label) }
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn {
            item(key = "pickers") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SectionHeader(title = stringResource(R.string.exams_class_results_title), subtitle = stringResource(R.string.exams_pick_exam))
                    FilterChipRow(examChips, state.selectedExamId, actions.onExamSelected)
                    if (sectionChips.isNotEmpty()) {
                        SectionHeader(title = stringResource(R.string.exams_class_results_section))
                        FilterChipRow(sectionChips, state.selectedSectionId, actions.onSectionSelected)
                    }
                }
            }
            if (state.notApproved) {
                item(key = "not_approved") { InlineMessage(stringResource(R.string.exams_class_results_not_approved), StatusTone.Warning) }
            }
            val listError = state.listError
            when {
                state.listLoading -> item(key = "loading") { LoadingState() }
                listError != null && state.results.isEmpty() ->
                    item(key = "error") { ErrorState(appErrorMessage(listError), onRetry = actions.onRefresh) }
                state.selectedSectionId == null ->
                    item(key = "no_sections") { EmptyState(stringResource(R.string.exams_class_results_no_sections)) }
                state.results.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.exams_class_results_empty),
                        message = stringResource(R.string.exams_class_results_empty_message),
                    )
                }
                else -> {
                    listError?.let { error -> item(key = "inline_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                    items(state.results, key = { "result_${it.studentId}" }) { result ->
                        ClassResultRow(result = result, onClick = { actions.onStudentClick(result.studentId) })
                    }
                }
            }
        }
    }
}

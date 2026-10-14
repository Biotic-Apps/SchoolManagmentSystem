package com.schoolapp.feature.questionbank.papers

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Article
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.components.FilterGrid
import com.schoolapp.feature.questionbank.components.FilterSpec
import com.schoolapp.feature.questionbank.components.PaperCard

/** "Paper Generator" tab: generated papers of the school; tap opens the paper. */
@Composable
internal fun PapersTab(
    viewModel: PapersViewModel,
    onOpenPaper: (String) -> Unit,
    bottomPadding: Boolean,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (bottomPadding) 96.dp else 16.dp)) {
            if (state.schoolId != null) {
                item(key = "filters") {
                    FilterGrid(
                        schools = state.schools,
                        schoolId = state.schoolId,
                        onSchoolSelected = viewModel::onSchoolSelected,
                        filters = listOf(
                            FilterSpec(stringResource(R.string.qb_field_subject), stringResource(R.string.qb_all_subjects), state.catalog.subjects, state.subjectId, viewModel::onSubjectSelected),
                            FilterSpec(stringResource(R.string.qb_field_class), stringResource(R.string.qb_all_classes), state.catalog.classes, state.classId, viewModel::onClassSelected),
                        ),
                    )
                }
            }
            papersBody(state, viewModel, onOpenPaper)
        }
    }
}

private fun LazyListScope.papersBody(state: PapersUiState, viewModel: PapersViewModel, onOpenPaper: (String) -> Unit) {
    when {
        state.isLoading -> item(key = "loading") { LoadingState() }
        state.error != null && state.papers.isEmpty() -> item(key = "error") {
            ErrorState(loadErrorMessage(state.error), onRetry = viewModel::retry)
        }
        state.noSchool -> item(key = "no_school") {
            EmptyState(title = stringResource(R.string.qb_no_school), message = stringResource(R.string.qb_no_school_message))
        }
        state.papers.isEmpty() -> item(key = "empty") {
            EmptyState(
                title = stringResource(R.string.qb_papers_empty),
                message = stringResource(if (state.hasFilters) R.string.qb_no_matches_message else R.string.qb_papers_empty_message),
                icon = Icons.AutoMirrored.Outlined.Article,
            )
        }
        else -> items(state.papers, key = { "p_${it.id}" }) { paper ->
            PaperCard(paper, onClick = { onOpenPaper(paper.id) })
        }
    }
}

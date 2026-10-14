package com.schoolapp.feature.questionbank.bank

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Quiz
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.difficultyOptions
import com.schoolapp.feature.questionbank.common.typeOptions
import com.schoolapp.feature.questionbank.components.FilterGrid
import com.schoolapp.feature.questionbank.components.FilterSpec
import com.schoolapp.feature.questionbank.components.QuestionCard

/** "Question Bank" tab: filters, the questions, detail sheet and delete confirmation. */
@Composable
internal fun QuestionsTab(
    viewModel: QuestionsViewModel,
    onEdit: (schoolId: String, questionId: String) -> Unit,
    bottomPadding: Boolean,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (bottomPadding) 96.dp else 16.dp)) {
            if (state.schoolId != null) {
                item(key = "filters") { QuestionFilters(state, viewModel) }
            }
            if (state.selected == null) {
                state.actionError?.let { item(key = "action_error") { InlineMessage(actionErrorMessage(it), StatusTone.Error) } }
            }
            questionsBody(state, viewModel)
        }
    }
    state.selected?.let { question ->
        QuestionDetailSheet(
            question = question,
            permissions = state.permissions,
            archiving = state.archivingId == question.id,
            actionError = state.actionError,
            onEdit = {
                viewModel.onOpen(null)
                onEdit(question.schoolId.ifBlank { state.schoolId.orEmpty() }, question.id)
            },
            onDelete = { viewModel.onAskArchive(question) },
            onDismiss = { viewModel.onOpen(null) },
        )
    }
    state.confirmArchive?.let {
        ConfirmDialog(
            title = stringResource(R.string.qb_delete_title),
            message = stringResource(R.string.qb_delete_message),
            confirmLabel = stringResource(R.string.qb_delete),
            onConfirm = viewModel::archive,
            onDismiss = { viewModel.onAskArchive(null) },
            destructive = true,
        )
    }
}

@Composable
private fun QuestionFilters(state: QuestionsUiState, viewModel: QuestionsViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        FilterGrid(
            schools = state.schools,
            schoolId = state.schoolId,
            onSchoolSelected = viewModel::onSchoolSelected,
            filters = listOf(
                FilterSpec(stringResource(R.string.qb_field_subject), stringResource(R.string.qb_all_subjects), state.catalog.subjects, state.subjectId, viewModel::onSubjectSelected),
                FilterSpec(stringResource(R.string.qb_field_class), stringResource(R.string.qb_all_classes), state.catalog.classes, state.classId, viewModel::onClassSelected),
                FilterSpec(stringResource(R.string.qb_field_type), stringResource(R.string.qb_all_types), typeOptions(), state.type?.key, viewModel::onTypeSelected),
                FilterSpec(stringResource(R.string.qb_field_difficulty), stringResource(R.string.qb_all_difficulties), difficultyOptions(), state.difficulty?.key, viewModel::onDifficultySelected),
            ),
        )
        SearchField(
            value = state.search,
            onValueChange = viewModel::onSearchChange,
            placeholder = stringResource(R.string.qb_search_hint),
        )
        if (state.hasFilters) AppTextButton(stringResource(R.string.qb_clear_filters), viewModel::clearFilters)
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.questionsBody(state: QuestionsUiState, viewModel: QuestionsViewModel) {
    when {
        state.isLoading -> item(key = "loading") { LoadingState() }
        state.error != null && state.questions.isEmpty() -> item(key = "error") {
            ErrorState(loadErrorMessage(state.error), onRetry = viewModel::retry)
        }
        state.noSchool -> item(key = "no_school") {
            EmptyState(title = stringResource(R.string.qb_no_school), message = stringResource(R.string.qb_no_school_message))
        }
        state.questions.isEmpty() -> item(key = "empty") {
            EmptyState(
                title = stringResource(if (state.hasFilters) R.string.qb_no_matches else R.string.qb_empty),
                message = stringResource(if (state.hasFilters) R.string.qb_no_matches_message else R.string.qb_empty_message),
                icon = Icons.Outlined.Quiz,
            )
        }
        else -> {
            items(state.questions, key = { "q_${it.id}" }) { question ->
                QuestionCard(question, onClick = { viewModel.onOpen(question) })
            }
            if (state.canLoadMore) {
                item(key = "more") {
                    SecondaryButton(stringResource(R.string.qb_load_more), viewModel::loadMore, loading = state.isLoadingMore)
                }
            }
        }
    }
}

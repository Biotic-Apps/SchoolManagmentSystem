package com.schoolapp.feature.syllabus.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.syllabus.R
import com.schoolapp.feature.syllabus.components.ChapterCard
import com.schoolapp.feature.syllabus.components.displayTitle
import com.schoolapp.feature.syllabus.components.progressSummary
import com.schoolapp.feature.syllabus.components.tone

@Composable
fun PlanDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: PlanDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.plan?.displayTitle() ?: stringResource(R.string.syllabus_plan_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        PlanDetailContent(state, onTopicClick = viewModel::onTopicSelected, onRetry = viewModel::load, modifier = Modifier.padding(padding))
    }
    state.editor?.let { editor ->
        TopicProgressSheet(
            editor = editor,
            today = state.today,
            onStatusChange = viewModel::onStatusChange,
            onCompletedOnChange = viewModel::onCompletedOnChange,
            onNoteChange = viewModel::onNoteChange,
            onSave = viewModel::save,
            onDismiss = viewModel::onDismissEditor,
        )
    }
}

@Composable
fun PlanDetailContent(
    state: PlanDetailUiState,
    onTopicClick: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val plan = state.plan
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        plan == null -> EmptyState(stringResource(R.string.syllabus_plan_not_found), modifier, icon = Icons.AutoMirrored.Outlined.MenuBook)
        else -> ScreenColumn(modifier) {
            state.message?.let { message -> item(key = "message") { InlineMessage(stringResource(message.textRes()), message.tone()) } }
            item(key = "progress") {
                AppCard(contentPadding = 0.dp) {
                    ProgressRow(
                        title = stringResource(R.string.syllabus_plan_progress),
                        percent = plan.progress.percent,
                        supporting = progressSummary(plan.progress),
                        tone = plan.progress.tone(),
                    )
                }
            }
            items(plan.chapters.size, key = { plan.chapters[it].id }) { index ->
                ChapterCard(
                    chapter = plan.chapters[index],
                    queuedTopicIds = state.queuedTopicIds,
                    onTopicClick = if (state.canEdit) onTopicClick else null,
                )
            }
        }
    }
}

private fun ProgressMessage.textRes(): Int = when (this) {
    ProgressMessage.SAVED -> R.string.syllabus_saved
    ProgressMessage.PENDING_REVIEW -> R.string.syllabus_saved_pending_review
    ProgressMessage.QUEUED -> R.string.syllabus_saved_queued
}

private fun ProgressMessage.tone(): StatusTone = when (this) {
    ProgressMessage.SAVED -> StatusTone.Success
    ProgressMessage.PENDING_REVIEW -> StatusTone.Warning
    ProgressMessage.QUEUED -> StatusTone.Info
}

package com.schoolapp.feature.exams.review

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.MarkValueRow
import com.schoolapp.feature.exams.components.SheetHeader
import com.schoolapp.feature.exams.components.markSheetStatusLabel
import com.schoolapp.feature.exams.components.tone
import com.schoolapp.feature.exams.review.components.ReviewBottomBar
import com.schoolapp.feature.exams.review.components.ReviewDecisionSheet

@Composable
internal fun SheetReviewRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SheetReviewViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title.ifBlank { state.sheet?.title ?: stringResource(R.string.exams_marks_title) },
                subtitle = state.sheet?.examName,
                navigationIcon = { BackButton(onBack) },
                actions = {
                    state.sheet?.let { StatusChip(markSheetStatusLabel(it.status), it.status.tone(), Modifier.padding(end = 16.dp)) }
                },
            )
        },
        bottomBar = {
            if (state.canDecide) {
                ReviewBottomBar(onReturn = { viewModel.openDecision(ReviewKind.RETURN) }, onAccept = { viewModel.openDecision(ReviewKind.ACCEPT) })
            }
        },
    ) { padding ->
        SheetReviewScreen(state, viewModel::load, Modifier.padding(padding))
    }
    state.decision?.let { decision ->
        ReviewDecisionSheet(
            decision = decision,
            sheetTitle = state.sheet?.title ?: state.title,
            onCommentChange = viewModel::onCommentChange,
            onConfirm = viewModel::confirmDecision,
            onDismiss = viewModel::onDismissDecision,
        )
    }
}

@Composable
internal fun SheetReviewScreen(state: SheetReviewUiState, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    val sheet = state.sheet
    when {
        state.isLoading -> LoadingState(modifier)
        sheet == null -> ErrorState(state.error?.let { appErrorMessage(it) } ?: stringResource(R.string.exams_sheet_unavailable), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            state.decided?.let { kind ->
                item(key = "decided") {
                    val text = stringResource(if (kind == ReviewKind.ACCEPT) R.string.exams_accepted_message else R.string.exams_returned_message)
                    InlineMessage(text, StatusTone.Success)
                }
            }
            sheet.comment?.takeIf { it.isNotBlank() && sheet.status != MarkSheetStatus.NOT_ENTERED }?.let { comment ->
                item(key = "comment") { InlineMessage(stringResource(R.string.exams_review_comment, comment), StatusTone.Neutral) }
            }
            if (sheet.status == MarkSheetStatus.SUBMITTED && !state.canApprove) {
                item(key = "no_approve") { InlineMessage(stringResource(R.string.exams_review_no_permission), StatusTone.Neutral) }
            }
            item(key = "header") {
                SheetHeader(
                    sheet = sheet,
                    entered = sheet.rows.count { !it.absent && it.marks != null },
                    absent = sheet.rows.count { it.absent },
                    pending = sheet.rows.count { it.isPending },
                    showTeacher = true,
                )
            }
            if (sheet.rows.isEmpty()) item(key = "empty") { EmptyState(stringResource(R.string.exams_roster_empty), icon = Icons.Outlined.Groups) }
            items(sheet.rows, key = { it.studentId }) { row ->
                MarkValueRow(row.rollNo, row.name, row.marks, row.absent, sheet.maxMarks)
            }
        }
    }
}

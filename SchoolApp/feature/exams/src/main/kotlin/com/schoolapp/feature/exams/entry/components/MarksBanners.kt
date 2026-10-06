package com.schoolapp.feature.exams.entry.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.MarkSheetSyncState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.entry.MarksEntryUiState
import com.schoolapp.feature.exams.entry.MarksMessage

/** Offline, sync, sheet status, outcome and blocking messages shown above the roster. */
internal fun LazyListScope.marksBanners(state: MarksEntryUiState, onDiscardLocal: () -> Unit) {
    if (state.offline) banner("offline") { InlineMessage(stringResource(R.string.exams_offline_banner), StatusTone.Warning) }
    when (state.syncState) {
        MarkSheetSyncState.QUEUED -> banner("sync") { InlineMessage(stringResource(R.string.exams_queued_message), StatusTone.Info) }
        MarkSheetSyncState.NEEDS_ATTENTION -> banner("sync") {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                InlineMessage(stringResource(R.string.exams_sync_needs_attention), StatusTone.Error)
                AppTextButton(stringResource(R.string.exams_discard_mine), onDiscardLocal)
            }
        }
        MarkSheetSyncState.NONE -> Unit
    }
    statusBanner(state)
    state.message?.takeUnless { it == MarksMessage.QUEUED && state.syncState != MarkSheetSyncState.NONE }?.let { message ->
        banner("message") { InlineMessage(stringResource(message.textRes()), message.tone()) }
    }
    state.actionError?.let { error -> banner("action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
    if (state.invalidBlocking) banner("invalid") { InlineMessage(stringResource(R.string.exams_fix_invalid), StatusTone.Error) }
    state.pendingBlocking?.let { count ->
        banner("pending") {
            InlineMessage(
                pluralStringResource(R.plurals.exams_pending_blocking, count, count) + " " + stringResource(R.string.exams_pending_hint),
                StatusTone.Error,
            )
        }
    }
    if (state.hasUnsentChanges && !state.isReadOnly && state.syncState == MarkSheetSyncState.NONE && state.message == null) {
        banner("unsent") { InlineMessage(stringResource(R.string.exams_unsent_changes), StatusTone.Info) }
    }
}

private fun LazyListScope.statusBanner(state: MarksEntryUiState) {
    val comment = state.sheet?.comment?.takeIf { it.isNotBlank() }
    when (state.status) {
        MarkSheetStatus.SUBMITTED -> banner("status") { InlineMessage(stringResource(R.string.exams_submitted_banner), StatusTone.Info) }
        MarkSheetStatus.PENDING_REVIEW -> banner("status") { InlineMessage(stringResource(R.string.exams_pending_review_banner), StatusTone.Warning) }
        MarkSheetStatus.ACCEPTED -> banner("status") { InlineMessage(stringResource(R.string.exams_accepted_banner), StatusTone.Success) }
        MarkSheetStatus.RETURNED -> banner("status") {
            val text = comment?.let { stringResource(R.string.exams_returned_banner_comment, it) } ?: stringResource(R.string.exams_returned_banner)
            InlineMessage(text, StatusTone.Error)
        }
        MarkSheetStatus.NOT_ENTERED, MarkSheetStatus.DRAFT -> if (!state.canEdit) {
            banner("status") { InlineMessage(stringResource(R.string.exams_view_only_banner), StatusTone.Neutral) }
        }
    }
}

private fun LazyListScope.banner(key: String, content: @Composable () -> Unit) = item(key = "banner_$key") { content() }

private fun MarksMessage.textRes(): Int = when (this) {
    MarksMessage.DRAFT_SAVED -> R.string.exams_draft_saved
    MarksMessage.SUBMITTED -> R.string.exams_submitted_message
    MarksMessage.QUEUED -> R.string.exams_queued_message
    MarksMessage.PENDING_REVIEW -> R.string.exams_pending_review_message
}

private fun MarksMessage.tone(): StatusTone = when (this) {
    MarksMessage.DRAFT_SAVED, MarksMessage.SUBMITTED -> StatusTone.Success
    MarksMessage.QUEUED -> StatusTone.Info
    MarksMessage.PENDING_REVIEW -> StatusTone.Warning
}

package com.schoolapp.feature.attendance.register.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.register.RegisterMessage
import com.schoolapp.feature.attendance.register.RegisterUiState

/** Offline, sync, conflict, lock and outcome messages shown above the roster. */
internal fun LazyListScope.registerBanners(
    state: RegisterUiState,
    onShowServerRegister: () -> Unit,
    onToggleCompare: () -> Unit,
    onDiscardMine: () -> Unit,
) {
    if (state.offline) banner("offline") { InlineMessage(stringResource(R.string.attendance_offline_banner), StatusTone.Warning) }
    when (state.syncState) {
        RegisterSyncState.QUEUED -> banner("sync") { InlineMessage(stringResource(R.string.attendance_sync_queued), StatusTone.Info) }
        RegisterSyncState.NEEDS_ATTENTION -> banner("sync") {
            BannerWithActions(stringResource(R.string.attendance_sync_needs_attention), StatusTone.Error) {
                AppTextButton(stringResource(R.string.attendance_show_server_register), onShowServerRegister)
            }
        }
        RegisterSyncState.NONE -> Unit
    }
    state.conflict?.let { conflict ->
        banner("conflict") {
            val text = conflict.submittedBy?.let { stringResource(R.string.attendance_already_submitted_by, it) }
                ?: stringResource(R.string.attendance_already_submitted)
            BannerWithActions(text, StatusTone.Error) {
                AppTextButton(
                    stringResource(if (conflict.comparing) R.string.attendance_hide_compare else R.string.attendance_compare_marks),
                    onToggleCompare,
                )
                AppTextButton(stringResource(R.string.attendance_discard_mine), onDiscardMine)
            }
        }
    }
    when (state.status) {
        RegisterStatus.LOCKED -> banner("locked") {
            val lockedAt = formatTimestamp(state.register?.lockedAt)
            val text = listOfNotNull(
                lockedAt?.let { stringResource(R.string.attendance_locked_at, it) } ?: stringResource(R.string.attendance_locked),
                stringResource(R.string.attendance_correction_hint).takeIf { state.canRequestCorrection },
            ).joinToString(" ")
            InlineMessage(text, StatusTone.Neutral)
        }
        RegisterStatus.PENDING_REVIEW -> banner("review") { InlineMessage(stringResource(R.string.attendance_pending_review_banner), StatusTone.Warning) }
        RegisterStatus.SUBMITTED -> if (state.conflict == null) {
            banner("submitted") {
                val by = state.register?.submittedBy?.name
                val text = by?.let { stringResource(R.string.attendance_submitted_by, it) } ?: stringResource(R.string.attendance_register_submitted)
                InlineMessage(text, StatusTone.Success)
            }
        }
        else -> Unit
    }
    state.message?.let { message -> banner("message") { InlineMessage(stringResource(message.textRes()), message.tone()) } }
    state.actionError?.let { error -> banner("action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
    state.unmarkedBlocking?.let { count ->
        banner("unmarked") { InlineMessage(pluralStringResource(R.plurals.attendance_unmarked_blocking, count, count), StatusTone.Error) }
    }
    if (state.hasUnsentChanges && !state.isReadOnly) {
        banner("unsent") { InlineMessage(stringResource(R.string.attendance_unsent_changes), StatusTone.Info) }
    }
}

private fun LazyListScope.banner(key: String, content: @Composable () -> Unit) = item(key = "banner_$key") { content() }

@Composable
private fun BannerWithActions(text: String, tone: StatusTone, actions: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        InlineMessage(text, tone)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { actions() }
    }
}

private fun RegisterMessage.textRes(): Int = when (this) {
    RegisterMessage.DRAFT_SAVED -> R.string.attendance_draft_saved
    RegisterMessage.SUBMITTED -> R.string.attendance_submitted_message
    RegisterMessage.QUEUED -> R.string.attendance_queued_message
    RegisterMessage.PENDING_REVIEW -> R.string.attendance_pending_review_message
    RegisterMessage.LOCKED -> R.string.attendance_locked_message
    RegisterMessage.CORRECTION_SENT -> R.string.attendance_correction_sent
}

private fun RegisterMessage.tone(): StatusTone = when (this) {
    RegisterMessage.DRAFT_SAVED, RegisterMessage.SUBMITTED, RegisterMessage.CORRECTION_SENT -> StatusTone.Success
    RegisterMessage.QUEUED -> StatusTone.Info
    RegisterMessage.PENDING_REVIEW -> StatusTone.Warning
    RegisterMessage.LOCKED -> StatusTone.Error
}

package com.schoolapp.feature.settings.support

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.MarkEmailRead
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.PageControls

/** Emails, SMS and push messages that could not be delivered, with resend and resend-all. */
internal fun LazyListScope.failedNotificationItems(state: FailedNotificationsUiState, canEdit: Boolean, vm: FailedNotificationsViewModel) {
    item(key = "fn_header") {
        SectionHeader(
            title = stringResource(R.string.settings_support_failed_title),
            subtitle = stringResource(R.string.settings_support_failed_hint),
            action = if (canEdit && state.total > 0) {
                { AppTextButton(stringResource(R.string.settings_support_resend_all), vm::askResendAll, leadingIcon = Icons.Outlined.Replay) }
            } else {
                null
            },
        )
    }
    item(key = "fn_filters") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChipRow(
                options = listOf(
                    SwitcherOption(ALL, stringResource(R.string.settings_support_all_channels)),
                    SwitcherOption("EMAIL", stringResource(R.string.settings_support_channel_email)),
                    SwitcherOption("SMS", stringResource(R.string.settings_support_channel_sms)),
                    SwitcherOption("PUSH", stringResource(R.string.settings_support_channel_push)),
                ),
                selectedId = state.filters.channel ?: ALL,
                onSelect = { id -> vm.setFilters(state.filters.copy(channel = id.takeIf { it != ALL })) },
            )
            DateRangeRow(
                from = state.filters.from,
                to = state.filters.to,
                onFrom = { vm.setFilters(state.filters.copy(from = it)) },
                onTo = { vm.setFilters(state.filters.copy(to = it)) },
            )
        }
    }
    state.message?.let { message ->
        item(key = "fn_message") {
            val text = if (message == SupportMessage.RESENT_ALL) R.string.settings_support_resent_all else R.string.settings_support_resent
            InlineMessage(stringResource(text), StatusTone.Success)
        }
    }
    state.actionError?.let { error -> item(key = "fn_action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
    val result = state.result
    when {
        state.isLoading && result == null -> item(key = "fn_loading") { LoadingState(rows = 2) }
        state.error != null -> item(key = "fn_error") { ErrorState(loadErrorMessage(state.error), onRetry = vm::reload) }
        result == null || result.items.isEmpty() -> item(key = "fn_empty") {
            EmptyState(
                title = stringResource(R.string.settings_support_failed_empty),
                message = stringResource(R.string.settings_support_failed_empty_message),
                icon = Icons.Outlined.MarkEmailRead,
            )
        }
        else -> {
            items(result.items, key = { "fn_${it.id}" }) { row ->
                FailedNotificationCard(row, canEdit, resending = state.resendingId == row.id, onResend = { vm.resend(row.id) })
            }
            item(key = "fn_pages") { PageControls(result.page, result.pageSize, result.total, vm::setPage, enabled = !state.isLoading) }
        }
    }
}

@Composable
internal fun FailedNotificationsDialogs(state: FailedNotificationsUiState, vm: FailedNotificationsViewModel) {
    if (!state.confirmAll) return
    val count = state.total
    ConfirmDialog(
        title = stringResource(R.string.settings_support_resend_all_title),
        message = pluralStringResource(R.plurals.settings_support_resend_all_message, count, count),
        confirmLabel = stringResource(R.string.settings_support_resend_count, count),
        onConfirm = vm::resendAll,
        onDismiss = vm::dismissResendAll,
    )
}

private const val ALL = "all"

package com.schoolapp.feature.settings.notifications

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.WhatsAppMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.PageControls

/** WhatsApp messages sent from this school, with delivery status (paged, filterable by status). */
internal fun LazyListScope.whatsAppLogItems(
    log: WhatsAppLogState,
    onFilter: (String?) -> Unit,
    onPage: (Int) -> Unit,
    onRetry: () -> Unit,
) {
    item(key = "log_header") {
        SectionHeader(
            title = stringResource(R.string.settings_notifications_log_title),
            subtitle = stringResource(R.string.settings_notifications_log_hint),
        )
    }
    item(key = "log_filter") {
        FilterChipRow(
            options = listOf(
                SwitcherOption(ALL, stringResource(R.string.settings_notifications_log_all)),
                SwitcherOption("SENT", stringResource(R.string.settings_notifications_log_sent)),
                SwitcherOption("FAILED", stringResource(R.string.settings_notifications_log_failed)),
                SwitcherOption("PENDING", stringResource(R.string.settings_notifications_log_pending)),
            ),
            selectedId = log.status ?: ALL,
            onSelect = { onFilter(it.takeIf { id -> id != ALL }) },
        )
    }
    val result = log.result
    when {
        log.isLoading && result == null -> item(key = "log_loading") { LoadingState(rows = 2) }
        log.error != null -> item(key = "log_error") { ErrorState(loadErrorMessage(log.error), onRetry = onRetry) }
        result == null || result.items.isEmpty() -> item(key = "log_empty") {
            EmptyState(
                title = stringResource(R.string.settings_notifications_log_empty),
                message = stringResource(R.string.settings_notifications_log_empty_message),
                icon = Icons.AutoMirrored.Outlined.Chat,
            )
        }
        else -> {
            items(result.items, key = { "log_${it.id}" }) { MessageCard(it) }
            item(key = "log_pages") { PageControls(result.page, result.pageSize, result.total, onPage, enabled = !log.isLoading) }
        }
    }
}

@Composable
private fun MessageCard(message: WhatsAppMessage) {
    val dash = stringResource(R.string.settings_dash)
    AppCard(verticalSpacing = 2.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = message.to.ifBlank { dash },
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(statusLabel(message.status), statusTone(message.status))
        }
        KeyValueRow(stringResource(R.string.settings_notifications_log_when), formatTimestamp(message.createdAt) ?: dash)
        KeyValueRow(stringResource(R.string.settings_notifications_log_template), message.templateName.ifBlank { dash })
        KeyValueRow(stringResource(R.string.settings_notifications_log_sent_at), formatTimestamp(message.sentAt) ?: dash)
        message.error?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
    }
}

@Composable
private fun statusLabel(status: String): String = when (status) {
    "SENT" -> stringResource(R.string.settings_notifications_log_sent)
    "FAILED" -> stringResource(R.string.settings_notifications_log_failed)
    else -> humanizeKey(status)
}

private fun statusTone(status: String): StatusTone = when (status) {
    "SENT" -> StatusTone.Success
    "FAILED" -> StatusTone.Error
    else -> StatusTone.Neutral
}

private const val ALL = "all"

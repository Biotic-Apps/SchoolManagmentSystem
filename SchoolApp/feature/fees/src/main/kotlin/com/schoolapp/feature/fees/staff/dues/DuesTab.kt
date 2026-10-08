package com.schoolapp.feature.fees.staff.dues

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.dues.components.DuesRowCard
import com.schoolapp.feature.fees.staff.dues.components.DuesSelectionBar

/** Callbacks of the Dues tab; reminder actions are wired only for `fees.edit` holders. */
internal class DuesActions(
    val onSearchChange: (String) -> Unit,
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onToggle: (String) -> Unit,
    val onToggleAll: () -> Unit,
    val onClear: () -> Unit,
    val onAskSend: () -> Unit,
    val onConfirmSend: () -> Unit,
    val onDismissSend: () -> Unit,
)

@Composable
internal fun DuesTab(state: DuesUiState, actions: DuesActions, modifier: Modifier = Modifier) {
    val currency = MoneyFormat.DEFAULT_CURRENCY
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier.fillMaxSize()) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
            item(key = "search") {
                SearchField(state.search, actions.onSearchChange, placeholder = stringResource(R.string.fees_search_dues))
            }
            state.remindersSent?.let { sent ->
                item(key = "sent") { InlineMessage(pluralStringResource(R.plurals.fees_reminders_sent, sent, sent), StatusTone.Success) }
            }
            state.actionError?.let { error -> item(key = "action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
                state.rows.isEmpty() -> item(key = "empty") {
                    EmptyState(stringResource(R.string.fees_no_dues), icon = Icons.Outlined.TaskAlt)
                }
                else -> {
                    item(key = "total") {
                        MoneyRow(
                            label = stringResource(R.string.fees_dues_total),
                            amountMinor = state.totalMinor,
                            currency = currency,
                            supporting = pluralStringResource(R.plurals.fees_student_count, state.rows.size, state.rows.size),
                            emphasized = true,
                        )
                    }
                    if (state.canRemind) {
                        item(key = "selection") {
                            DuesSelectionBar(
                                selectedCount = state.selected.size,
                                allSelected = state.allSelected,
                                hasRows = state.rows.isNotEmpty(),
                                sending = state.isSending,
                                onToggleAll = actions.onToggleAll,
                                onClear = actions.onClear,
                                onSend = actions.onAskSend,
                            )
                        }
                    }
                    items(state.rows, key = { "due_${it.studentId}" }) { row ->
                        DuesRowCard(
                            row = row,
                            currency = currency,
                            selected = if (state.canRemind) row.studentId in state.selected else null,
                            onToggle = { actions.onToggle(row.studentId) },
                        )
                    }
                }
            }
        }
    }
    if (state.confirmingReminders) {
        val count = state.selected.size
        ConfirmDialog(
            title = stringResource(R.string.fees_reminders_confirm_title),
            message = pluralStringResource(R.plurals.fees_reminders_confirm_message, count, count),
            confirmLabel = stringResource(R.string.fees_send_reminders),
            onConfirm = actions.onConfirmSend,
            onDismiss = actions.onDismissSend,
        )
    }
}

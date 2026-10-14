package com.schoolapp.feature.payroll.overtime

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.DoneAll
import androidx.compose.material.icons.outlined.ManageSearch
import androidx.compose.material.icons.outlined.MoreTime
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.MonthHeader
import com.schoolapp.feature.payroll.components.formatHours

/** "Overtime" tab: entries of the month, scan attendance, add by hand, approve / reject / remove. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun OvertimeTab(
    branch: FinanceBranch,
    session: SessionContext,
    modifier: Modifier = Modifier,
    viewModel: OvertimeViewModel = hiltViewModel(key = "payroll_overtime_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch.id) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val rules = OvertimeRowRules(session.has("payroll.approve"), session.has("payroll.edit"), state.locked)
    val data = state.data
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp), itemSpacing = 12.dp) {
                item(key = "month") { MonthHeader(state.month, state.canGoNext, viewModel::previousMonth, viewModel::nextMonth) }
                if (data != null) {
                    item(key = "actions") {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (!state.locked && data.overtimeEnabled) {
                                SecondaryButton(stringResource(R.string.payroll_ot_find), viewModel::scan, loading = state.scanning, leadingIcon = Icons.Outlined.ManageSearch)
                            }
                            if (rules.canApprove && !state.locked && state.pendingIds.isNotEmpty()) {
                                PrimaryButton(stringResource(R.string.payroll_ot_approve_all), viewModel::approveAll, loading = state.approvingAll, leadingIcon = Icons.Outlined.DoneAll)
                            }
                        }
                    }
                    item(key = "info") { OvertimeInfo(data.overtimeEnabled, data.staffLeavesAt, data.approvedMinutes) }
                    if (state.locked) item(key = "locked") { InlineMessage(stringResource(R.string.payroll_ot_locked), StatusTone.Warning) }
                }
                state.notice?.let { notice -> item(key = "notice") { InlineMessage(noticeText(notice), StatusTone.Success) } }
                state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                when {
                    state.isLoading && data == null -> item(key = "loading") { LoadingState() }
                    data == null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                    data.items.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.payroll_ot_empty),
                            message = stringResource(R.string.payroll_ot_empty_message),
                            icon = Icons.Outlined.MoreTime,
                        )
                    }
                    else -> items(data.items, key = { "ot_${it.id}" }) { entry ->
                        OvertimeRow(
                            entry = entry,
                            rules = rules,
                            busy = state.busyId == entry.id || state.approvingAll,
                            onDecide = { approve -> viewModel.decide(entry, approve) },
                            onRemove = { viewModel.askRemove(entry) },
                        )
                    }
                }
            }
        }
        if (data != null && rules.canEdit && !state.locked) {
            AppFloatingButton(
                text = stringResource(R.string.payroll_ot_add),
                icon = Icons.Outlined.Add,
                onClick = viewModel::openForm,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    state.form?.let { form ->
        OvertimeFormSheet(form, state.month, state.staffOptions, viewModel::editForm, viewModel::saveForm, viewModel::dismissForm)
    }
    state.confirmRemove?.let { entry ->
        ConfirmDialog(
            title = stringResource(R.string.payroll_ot_remove_title),
            message = stringResource(R.string.payroll_ot_remove_message, entry.staffName, formatHours(entry.minutes), formatDate(entry.date).orEmpty()),
            confirmLabel = stringResource(R.string.payroll_ot_remove),
            onConfirm = viewModel::confirmRemove,
            onDismiss = viewModel::dismissRemove,
            destructive = true,
        )
    }
}

@Composable
private fun OvertimeInfo(enabled: Boolean, leavesAt: String?, approvedMinutes: Int) {
    if (!enabled) {
        InlineMessage(stringResource(R.string.payroll_ot_switched_off), StatusTone.Warning)
        return
    }
    val base = leavesAt?.let { stringResource(R.string.payroll_ot_leave_time, formatTime(it).orEmpty()) }
        ?: stringResource(R.string.payroll_ot_no_leave_time)
    val approved = if (approvedMinutes > 0) " " + stringResource(R.string.payroll_ot_approved_month, formatHours(approvedMinutes)) else ""
    InlineMessage(base + approved, StatusTone.Info)
}

@Composable
private fun noticeText(notice: OvertimeNotice): String = when (notice) {
    is OvertimeNotice.Found -> if (notice.count > 0) {
        pluralStringResource(R.plurals.payroll_ot_found, notice.count, notice.count)
    } else {
        stringResource(R.string.payroll_ot_found_none)
    }
    OvertimeNotice.Added -> stringResource(R.string.payroll_ot_added)
    OvertimeNotice.Approved -> stringResource(R.string.payroll_ot_approved_done)
    OvertimeNotice.Rejected -> stringResource(R.string.payroll_ot_rejected_done)
    OvertimeNotice.Removed -> stringResource(R.string.payroll_ot_removed)
}

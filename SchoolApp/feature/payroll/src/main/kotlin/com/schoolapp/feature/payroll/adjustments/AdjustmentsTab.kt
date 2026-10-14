package com.schoolapp.feature.payroll.adjustments

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Block
import androidx.compose.material.icons.outlined.Savings
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.payroll.extras.AdjustmentStatus
import com.schoolapp.core.model.payroll.extras.PayrollAdjustment
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.MonthHeader

/** "Bonus & deductions": adjustments of the month with add and cancel. */
@Composable
internal fun AdjustmentsTab(
    branch: FinanceBranch,
    session: SessionContext,
    modifier: Modifier = Modifier,
    viewModel: AdjustmentsViewModel = hiltViewModel(key = "payroll_adjustments_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch.id) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val canEdit = session.has("payroll.edit")
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp), itemSpacing = 12.dp) {
                item(key = "month") { MonthHeader(state.month, true, viewModel::previousMonth, viewModel::nextMonth) }
                item(key = "staff") {
                    CreatablePickerField(
                        label = stringResource(R.string.payroll_extra_staff),
                        options = state.staffOptions,
                        selectedId = state.staffId,
                        onSelect = viewModel::onStaff,
                        noneLabel = stringResource(R.string.payroll_extra_all_staff),
                        fallbackValue = stringResource(R.string.payroll_extra_all_staff),
                    )
                }
                state.notice?.let { notice ->
                    item(key = "notice") {
                        InlineMessage(
                            stringResource(if (notice == AdjustmentNotice.ADDED) R.string.payroll_adj_added else R.string.payroll_adj_cancelled),
                            StatusTone.Success,
                        )
                    }
                }
                val items = state.items
                when {
                    state.isLoading && items == null -> item(key = "loading") { LoadingState() }
                    items == null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                    items.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.payroll_adj_empty),
                            message = stringResource(R.string.payroll_adj_empty_message),
                            icon = Icons.Outlined.Savings,
                        )
                    }
                    else -> items(items, key = { "adj_${it.id}" }) { item ->
                        AdjustmentRow(item, canCancel = canEdit && item.status == AdjustmentStatus.PENDING, onCancel = { viewModel.askCancel(item) })
                    }
                }
            }
        }
        if (canEdit) {
            AppFloatingButton(
                text = stringResource(R.string.payroll_adj_add),
                icon = Icons.Outlined.Add,
                onClick = viewModel::openForm,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    state.form?.let { AdjustmentFormSheet(it, state.staffOptions, viewModel::editForm, viewModel::saveForm, viewModel::dismissForm) }
    state.cancel?.let { CancelAdjustmentSheet(it, viewModel::onCancelReason, viewModel::confirmCancel, viewModel::dismissCancel) }
}

@Composable
private fun AdjustmentRow(item: PayrollAdjustment, canCancel: Boolean, onCancel: () -> Unit) {
    AppCard(Modifier.fillMaxWidth(), verticalSpacing = 6.dp, enabled = item.status != AdjustmentStatus.CANCELLED) {
        SectionHeader(
            title = item.staffName,
            subtitle = adjustmentStatusLabel(item.status),
            action = { StatusChip(kindLabel(item.kind), kindTone(item.kind)) },
        )
        MoneyRow(
            label = stringResource(R.string.payroll_adj_amount),
            amountMinor = if (item.kind.adds) item.amountMinor else -item.amountMinor,
            amountColor = if (item.kind.adds) AppColors.TextPrimary else AppColors.Error,
            emphasized = true,
        )
        Text(item.reason, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        item.cancelReason?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        if (canCancel) {
            AppTextButton(stringResource(R.string.payroll_adj_cancel_action), onCancel, leadingIcon = Icons.Outlined.Block, contentColor = AppColors.Error)
        }
    }
}

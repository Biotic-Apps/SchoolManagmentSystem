package com.schoolapp.feature.expenses.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.expenses.ExpenseFormDestination
import com.schoolapp.feature.expenses.R

@Composable
internal fun ExpenseDetailRoute(
    onBack: () -> Unit,
    onEdit: (ExpenseFormDestination) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExpenseDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val external = rememberExternalActions()
    LifecycleResumeEffect(viewModel) {
        viewModel.onResume()
        onPauseOrDispose { }
    }
    val noticeText = state.notice?.let { noticeMessage(it) }
    LaunchedEffect(state.notice) {
        val text = noticeText ?: return@LaunchedEffect
        viewModel.consumeNotice()
        snackbar.showSnackbar(text)
    }
    val expense = state.expense
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.expenses_detail_title),
                navigationIcon = { BackButton(onBack) },
                actions = {
                    val branchId = expense?.branchId
                    if (state.canEdit && expense != null && branchId != null) {
                        IconButton(onClick = { onEdit(ExpenseFormDestination(branchId, viewModel.schoolId, expense.id)) }) {
                            Icon(Icons.Outlined.Edit, contentDescription = stringResource(R.string.expenses_edit_expense), tint = AppColors.Primary)
                        }
                    }
                },
            )
        },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(contentModifier)
            expense == null -> ErrorState(
                loadErrorMessage(state.error ?: AppError.Unknown()),
                contentModifier,
                onRetry = viewModel::load,
            )
            else -> ExpenseDetailContent(
                state = state,
                expense = expense,
                actions = ExpenseDetailActions(
                    onRefresh = viewModel::load,
                    onSubmit = viewModel::askSubmit,
                    onPay = viewModel::openPayment,
                    onOpenBill = external::open,
                ),
                modifier = contentModifier,
            )
        }
    }
    if (state.confirmSubmit) {
        ConfirmDialog(
            title = stringResource(R.string.expenses_submit_title),
            message = stringResource(R.string.expenses_submit_message),
            confirmLabel = stringResource(R.string.expenses_submit),
            onConfirm = viewModel::submit,
            onDismiss = viewModel::dismissSubmit,
        )
    }
    state.payment?.let { form ->
        PaymentSheet(
            form = form,
            balanceMinor = expense?.balanceMinor ?: 0,
            actions = PaymentSheetActions(
                onAmount = viewModel::onPaymentAmount,
                onMethod = viewModel::onPaymentMethod,
                onDate = viewModel::onPaymentDate,
                onReference = viewModel::onPaymentReference,
                onSave = viewModel::recordPayment,
                onDismiss = viewModel::closePayment,
            ),
        )
    }
}

@Composable
private fun noticeMessage(notice: ExpenseNotice): String = stringResource(
    when (notice) {
        ExpenseNotice.CREATED -> R.string.expenses_notice_created
        ExpenseNotice.UPDATED -> R.string.expenses_notice_updated
        ExpenseNotice.SUBMITTED -> R.string.expenses_notice_submitted
        ExpenseNotice.PAID -> R.string.expenses_notice_paid
    },
)

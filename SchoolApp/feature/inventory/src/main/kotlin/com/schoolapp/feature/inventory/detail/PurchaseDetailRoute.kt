package com.schoolapp.feature.inventory.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SavedEffect
import kotlinx.coroutines.flow.merge

/** Purchase request detail: order it, receive goods, create the vendor bill. */
@Composable
internal fun PurchaseDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: PurchaseDetailViewModel = hiltViewModel(),
    orderViewModel: OrderFormViewModel = hiltViewModel(),
    receiveViewModel: ReceiveFormViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val orderForm by orderViewModel.uiState.collectAsStateWithLifecycle()
    val receiveForm by receiveViewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val saved = remember(viewModel, orderViewModel, receiveViewModel) { merge(viewModel.saved, orderViewModel.saved, receiveViewModel.saved) }
    SavedEffect(saved, snackbar) { message -> if (message.res != R.string.inv_bill_saved) viewModel.load() }
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.inv_purchase_request),
                subtitle = state.request?.requestNo,
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        PurchaseDetailContent(
            state = state,
            actions = PurchaseDetailActions(
                onRetry = viewModel::retry,
                onRefresh = viewModel::refresh,
                onCreateOrder = { state.request?.let { orderViewModel.open(it, viewModel.schoolId) } },
                onReceive = { state.order?.let(receiveViewModel::open) },
                onBill = viewModel::askBill,
            ),
            modifier = Modifier.padding(padding),
        )
    }
    if (orderForm.open) OrderSheet(orderForm, viewModel.today, state.rights.canAdd || state.rights.canBill, orderViewModel)
    if (receiveForm.open) ReceiveSheet(receiveForm, receiveViewModel)
    if (state.confirmBill) {
        ConfirmDialog(
            title = stringResource(R.string.inv_bill_title),
            message = stringResource(R.string.inv_bill_message),
            confirmLabel = stringResource(R.string.inv_create_bill),
            onConfirm = viewModel::confirmBill,
            onDismiss = viewModel::dismissBill,
        )
    }
}

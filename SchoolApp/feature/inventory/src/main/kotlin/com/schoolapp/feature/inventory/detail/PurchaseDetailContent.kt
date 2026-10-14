package com.schoolapp.feature.inventory.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Inventory
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.inventory.R

internal class PurchaseDetailActions(
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onCreateOrder: () -> Unit,
    val onReceive: () -> Unit,
    val onBill: () -> Unit,
)

@Composable
internal fun PurchaseDetailContent(state: PurchaseDetailUiState, actions: PurchaseDetailActions, modifier: Modifier = Modifier) {
    val request = state.request
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier.fillMaxSize()) {
        when {
            state.isLoading && request == null -> LoadingState()
            request == null -> PullableState { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = actions.onRetry) }
            else -> ScreenColumn(contentPadding = PaddingValues(16.dp), itemSpacing = 12.dp) {
                state.actionError?.let { item(key = "action_error") { InlineMessage(actionErrorMessage(it), StatusTone.Error) } }
                item(key = "summary") { RequestSummaryCard(request) }
                when (request.status) {
                    PurchaseRequestStatus.PENDING -> item(key = "pending") { InlineMessage(stringResource(R.string.inv_waiting_approval), StatusTone.Info) }
                    PurchaseRequestStatus.REJECTED -> item(key = "rejected") { InlineMessage(stringResource(R.string.inv_rejected_note), StatusTone.Error) }
                    else -> Unit
                }
                if (state.canOrder || state.canReceive || state.canBill) {
                    item(key = "actions") { DetailButtons(state, actions) }
                }
                item(key = "lines") { RequestLinesCard(request) }
                state.order?.let { order -> item(key = "order") { OrderSection(order) } }
            }
        }
    }
}

@Composable
private fun DetailButtons(state: PurchaseDetailUiState, actions: PurchaseDetailActions) {
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.canOrder) {
            PrimaryButton(stringResource(R.string.inv_create_order), actions.onCreateOrder, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.ShoppingCart)
        }
        if (state.canReceive) {
            PrimaryButton(stringResource(R.string.inv_receive_items), actions.onReceive, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Inventory)
        }
        if (state.canBill) {
            SecondaryButton(
                stringResource(R.string.inv_create_bill),
                actions.onBill,
                Modifier.fillMaxWidth(),
                loading = state.isBilling,
                leadingIcon = Icons.AutoMirrored.Outlined.ReceiptLong,
            )
        }
    }
}

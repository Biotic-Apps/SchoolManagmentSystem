package com.schoolapp.feature.fees.parent

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.InvoiceDetailDestination
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.parent.components.FeeSummaryCard
import com.schoolapp.feature.fees.parent.components.InvoiceRow

@Composable
internal fun ParentFeesRoute(onOpen: (Any) -> Unit, modifier: Modifier = Modifier, viewModel: ParentFeesViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(viewModel) {
        if (resumedOnce) viewModel.refresh()
        resumedOnce = true
        onPauseOrDispose { }
    }
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier.fillMaxSize()) {
        ParentFeesScreen(
            state = state,
            onRetry = viewModel::retry,
            onInvoiceClick = { onOpen(InvoiceDetailDestination(it)) },
        )
    }
}

@Composable
internal fun ParentFeesScreen(
    state: ParentFeesUiState,
    onRetry: () -> Unit,
    onInvoiceClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val hasData = state.summary != null || state.invoices.isNotEmpty()
    when {
        state.childId == null && !state.isLoading -> EmptyState(
            title = stringResource(R.string.fees_no_child),
            message = stringResource(R.string.fees_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        state.isLoading && !hasData -> LoadingState(modifier)
        state.error != null && !hasData -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            item(key = "title") {
                SectionHeader(title = stringResource(R.string.fees_parent_title), subtitle = state.childName)
            }
            state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            state.summary?.let { summary -> item(key = "summary") { FeeSummaryCard(summary) } }
            item(key = "invoices_header") { SectionHeader(title = stringResource(R.string.fees_invoices)) }
            if (state.invoices.isEmpty()) {
                item(key = "invoices_empty") {
                    EmptyState(title = stringResource(R.string.fees_no_invoices), icon = Icons.AutoMirrored.Outlined.ReceiptLong)
                }
            }
            items(state.invoices, key = { "inv_${it.id}" }) { invoice ->
                InvoiceRow(invoice, onClick = { onInvoiceClick(invoice.id) })
            }
            item(key = "note") {
                Text(stringResource(R.string.fees_parent_note), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
}

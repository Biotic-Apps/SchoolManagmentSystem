package com.schoolapp.feature.fees.staff.invoices

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.Checklist
import androidx.compose.material.icons.outlined.Print
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.navigation.InvoiceDetailDestination
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.fees.R

/** "Invoices": list with filters, issue drafts, generate from fee plans, new invoice and bulk challans. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun InvoicesTab(
    branch: FinanceBranch,
    session: SessionContext,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: InvoicesViewModel = hiltViewModel(key = "fees_invoices_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch) }
    var resumed by remember { mutableStateOf(false) }
    LifecycleResumeEffect(viewModel) {
        if (resumed) viewModel.refresh()
        resumed = true
        onPauseOrDispose { }
    }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(state.urlToOpen) {
        state.urlToOpen?.let {
            viewModel.onUrlOpened()
            external.open(it)
        }
    }
    val canAdd = session.has("fees.add")
    val canIssue = session.has("fees.approve")
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp), itemSpacing = 12.dp) {
                item(key = "actions") {
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (canAdd) {
                            AppTextButton(stringResource(R.string.fees_inv_generate), viewModel::openGenerate, leadingIcon = Icons.Outlined.AutoAwesome)
                        }
                        AppTextButton(stringResource(R.string.fees_inv_print), viewModel::openPrint, leadingIcon = Icons.Outlined.Print)
                        if (canIssue) {
                            AppTextButton(
                                stringResource(if (state.selecting) R.string.fees_inv_select_done else R.string.fees_inv_select),
                                viewModel::toggleSelecting,
                                leadingIcon = Icons.Outlined.Checklist,
                            )
                        }
                    }
                }
                item(key = "filters") { InvoiceFilters(state, viewModel) }
                state.notice?.let { notice -> item(key = "notice") { NoticeMessages(notice) } }
                state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                if (state.selecting && state.selected.isNotEmpty()) {
                    item(key = "issue") {
                        PrimaryButton(
                            pluralStringResource(R.plurals.fees_inv_issue_n, state.selected.size, state.selected.size),
                            viewModel::issueSelected,
                            Modifier.fillMaxWidth(),
                            loading = state.issuing,
                            leadingIcon = Icons.AutoMirrored.Outlined.Send,
                        )
                    }
                }
                val invoices = state.invoices
                when {
                    state.isLoading || (invoices == null && state.error == null) -> item(key = "loading") { LoadingState() }
                    invoices == null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                    invoices.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.fees_inv_empty),
                            message = stringResource(R.string.fees_inv_empty_message),
                            icon = Icons.AutoMirrored.Outlined.ReceiptLong,
                        )
                    }
                    else -> items(invoices, key = { "inv_${it.id}" }) { invoice ->
                        val selectable = state.selecting && invoice.status == InvoiceStatus.DRAFT
                        InvoiceListRow(
                            invoice = invoice,
                            selected = if (selectable) invoice.id in state.selected else null,
                            onClick = { if (selectable) viewModel.toggle(invoice.id) else onOpen(InvoiceDetailDestination(invoice.id)) },
                        )
                    }
                }
            }
        }
        if (canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.fees_inv_new),
                icon = Icons.Outlined.Add,
                onClick = { onOpen(NewInvoiceDestination(branch.schoolId)) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    state.generate?.let {
        GenerateInvoicesSheet(it, state.sessions, state.classes, viewModel::editGenerate, viewModel::runGenerate, viewModel::dismissGenerate)
    }
    state.print?.let {
        PrintChallansSheet(it, state.classes, viewModel::editPrint, viewModel::onPrintClass, viewModel::runPrint, viewModel::dismissPrint)
    }
}

@Composable
private fun NoticeMessages(notice: InvoicesNotice) {
    when (notice) {
        is InvoicesNotice.Generated -> InlineMessage(
            notice.count?.let { pluralStringResource(R.plurals.fees_inv_generated_n, it, it) } ?: stringResource(R.string.fees_inv_generated),
            StatusTone.Success,
        )
        is InvoicesNotice.Issued -> Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(pluralStringResource(R.plurals.fees_inv_issued_n, notice.count, notice.count), StatusTone.Success)
            if (notice.failures.isNotEmpty()) {
                InlineMessage(stringResource(R.string.fees_inv_issue_failed, notice.failures.distinct().joinToString("; ")), StatusTone.Warning)
            }
        }
    }
}

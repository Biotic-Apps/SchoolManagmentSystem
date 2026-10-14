package com.schoolapp.feature.fees.staff

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.fees.R
import androidx.compose.runtime.key
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.scope.FeesBranchBar
import com.schoolapp.feature.fees.scope.FeesScopeViewModel
import com.schoolapp.feature.fees.staff.concessions.ConcessionsTab
import com.schoolapp.feature.fees.staff.invoices.InvoicesTab
import com.schoolapp.feature.fees.staff.ledger.StudentLedgerDestination
import com.schoolapp.feature.fees.staff.paymentlist.PaymentsListTab
import com.schoolapp.feature.fees.staff.structure.FeeStructureTab
import com.schoolapp.feature.fees.RecordPaymentDestination
import com.schoolapp.feature.fees.staff.dues.DuesActions
import com.schoolapp.feature.fees.staff.dues.DuesTab
import com.schoolapp.feature.fees.staff.dues.DuesViewModel
import com.schoolapp.feature.fees.staff.proofs.ProofsActions
import com.schoolapp.feature.fees.staff.proofs.ProofsTab
import com.schoolapp.feature.fees.staff.proofs.ProofsViewModel
import com.schoolapp.feature.fees.staff.payments.PaymentActionsHost
import com.schoolapp.feature.fees.staff.payments.PaymentActionsViewModel
import com.schoolapp.feature.fees.staff.payments.PaymentNotice
import com.schoolapp.feature.fees.staff.today.TodayTab
import com.schoolapp.feature.fees.staff.today.components.CloseDayActions
import com.schoolapp.feature.fees.staff.today.TodayViewModel

/** Accountant / principal / super admin: collection, invoices, payments, dues, proofs, concessions and fee structure. */
@Composable
internal fun StaffFeesRoute(
    roleKey: String,
    onOpen: (Any) -> Unit,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    todayViewModel: TodayViewModel = hiltViewModel(key = "fees_today_$roleKey"),
    duesViewModel: DuesViewModel = hiltViewModel(key = "fees_dues_$roleKey"),
    proofsViewModel: ProofsViewModel = hiltViewModel(key = "fees_proofs_$roleKey"),
    paymentsViewModel: PaymentActionsViewModel = hiltViewModel(key = "fees_payments_$roleKey"),
) {
    val payments by paymentsViewModel.uiState.collectAsStateWithLifecycle()
    val paymentChanges by paymentsViewModel.changes.collectAsStateWithLifecycle()
    LaunchedEffect(paymentChanges) { if (paymentChanges > 0) todayViewModel.refresh() }
    val today by todayViewModel.uiState.collectAsStateWithLifecycle()
    val dues by duesViewModel.uiState.collectAsStateWithLifecycle()
    val proofs by proofsViewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val scopeViewModel: FeesScopeViewModel = hiltViewModel(key = "fees_scope_$roleKey")
    val scope by scopeViewModel.state.collectAsStateWithLifecycle()
    val branch = scope.branch
    val session = scope.session
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(todayViewModel) {
        if (resumedOnce) todayViewModel.refresh()
        resumedOnce = true
        onPauseOrDispose { }
    }
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            FeesBranchBar(scope, scopeViewModel::select)
            AppTabs(
                titles = listOf(
                    stringResource(R.string.fees_tab_today),
                    stringResource(R.string.fees_tab_invoices),
                    stringResource(R.string.fees_tab_payments),
                    stringResource(R.string.fees_tab_dues),
                    stringResource(R.string.fees_tab_proofs),
                    stringResource(R.string.fees_tab_concessions),
                    stringResource(R.string.fees_tab_structure),
                ),
                selectedIndex = tab,
                onSelect = { tab = it },
            )
            val needsBranch = tab in BRANCH_TABS
            if (needsBranch && (branch == null || session == null)) {
                when {
                    !scope.ready -> LoadingState()
                    scope.error != null -> ErrorState(appErrorMessage(scope.error!!), onRetry = scopeViewModel::retry)
                    else -> EmptyState(stringResource(R.string.fees_no_branch))
                }
            } else if (needsBranch && branch != null && session != null) {
                key(branch.id) {
                    when (tab) {
                        1 -> InvoicesTab(branch, session, onOpen)
                        2 -> PaymentsListTab(branch, session, paymentsViewModel::open, onOpen)
                        5 -> ConcessionsTab(branch, session)
                        else -> FeeStructureTab(branch, session, onOpen)
                    }
                }
            } else when (tab) {
                0 -> Column(Modifier.fillMaxSize()) {
                    payments.notice?.let { notice ->
                        InlineMessage(
                            stringResource(if (notice == PaymentNotice.REVERSAL_SENT) R.string.fees_reversal_sent else R.string.fees_refund_sent),
                            StatusTone.Success,
                            Modifier.padding(start = 16.dp, top = 12.dp, end = 16.dp),
                        )
                    }
                    TodayTab(
                        state = today,
                        onRetry = todayViewModel::retry,
                        onRefresh = todayViewModel::refresh,
                        onOpenApprovals = onOpenApprovals,
                        onOpenPayment = paymentsViewModel::open,
                        onOpenCloseDay = todayViewModel::openCloseDay,
                        closeActions = CloseDayActions(
                            onCashChange = todayViewModel::onCashChange,
                            onNoteChange = todayViewModel::onNoteChange,
                            onSubmit = todayViewModel::submitCloseDay,
                            onConfirm = todayViewModel::confirmCloseDay,
                            onCancelConfirm = todayViewModel::cancelCloseConfirm,
                            onDismiss = todayViewModel::dismissCloseDay,
                        ),
                    )
                }
                3 -> DuesTab(
                    state = dues,
                    actions = DuesActions(
                        onSearchChange = duesViewModel::onSearchChange,
                        onRetry = duesViewModel::retry,
                        onRefresh = duesViewModel::refresh,
                        onToggle = duesViewModel::toggle,
                        onToggleAll = duesViewModel::toggleAll,
                        onClear = duesViewModel::clearSelection,
                        onAskSend = duesViewModel::askToSendReminders,
                        onConfirmSend = duesViewModel::sendReminders,
                        onDismissSend = duesViewModel::dismissReminders,
                        onOpenLedger = { row -> onOpen(StudentLedgerDestination(row.studentId, row.studentName)) },
                    ),
                )
                4 -> ProofsTab(
                    state = proofs,
                    actions = ProofsActions(
                        onRetry = proofsViewModel::retry,
                        onRefresh = proofsViewModel::refresh,
                        onOpen = proofsViewModel::open,
                        onOpenFile = external::open,
                        onChoose = proofsViewModel::choose,
                        onTextChange = proofsViewModel::onTextChange,
                        onConfirm = proofsViewModel::confirm,
                        onDismiss = proofsViewModel::dismiss,
                    ),
                )
            }
        }
        PaymentActionsHost(paymentsViewModel, payments, external::open)
        if (today.canRecord && tab in RECORD_TABS) {
            AppFloatingButton(
                text = stringResource(R.string.fees_record_payment),
                icon = Icons.Outlined.Payments,
                onClick = { onOpen(RecordPaymentDestination) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}

/** Tabs that work on the selected branch (Invoices, Payments, Concessions, Fee structure). */
private val BRANCH_TABS = setOf(1, 2, 5, 6)

/** Tabs that show the "Record payment" button. */
private val RECORD_TABS = setOf(0, 2, 3)

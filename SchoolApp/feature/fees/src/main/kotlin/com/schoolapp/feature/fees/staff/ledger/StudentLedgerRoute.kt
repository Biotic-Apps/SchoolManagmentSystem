package com.schoolapp.feature.fees.staff.ledger

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.ledger.LedgerEntry
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.MoneyTile
import kotlinx.serialization.Serializable

@Serializable
internal data class StudentLedgerDestination(val studentId: String, val name: String)

fun NavGraphBuilder.feesLedgerDestinations(navController: NavHostController) {
    composable<StudentLedgerDestination> { entry ->
        StudentLedgerRoute(entry.toRoute<StudentLedgerDestination>().name, onBack = navController::popBackStack)
    }
}

@Composable
internal fun StudentLedgerRoute(name: String, onBack: () -> Unit, viewModel: StudentLedgerViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        topBar = { AppTopBar(title = stringResource(R.string.fees_ledger_title), subtitle = name, navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val ledger = state.ledger
        val modifier = Modifier.padding(padding)
        when {
            state.isLoading && ledger == null -> LoadingState(modifier)
            ledger == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), modifier, onRetry = viewModel::retry)
            else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
                ScreenColumn(itemSpacing = 12.dp) {
                    state.summary?.let { item(key = "summary") { SummaryTiles(it) } }
                    item(key = "header") {
                        SectionHeader(
                            stringResource(R.string.fees_ledger_entries),
                            subtitle = stringResource(R.string.fees_ledger_balance, MoneyFormat.format(ledger.balanceMinor, ledger.currency)),
                        )
                    }
                    if (ledger.entries.isEmpty()) {
                        item(key = "empty") { EmptyState(stringResource(R.string.fees_ledger_empty), icon = Icons.AutoMirrored.Outlined.ReceiptLong) }
                    }
                    items(ledger.entries, key = { "le_${it.id}" }) { LedgerRow(it, ledger.currency) }
                }
            }
        }
    }
}

@Composable
private fun SummaryTiles(summary: FeeSummary) {
    val currency = summary.currency
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MoneyTile(stringResource(R.string.fees_ledger_total_due), summary.totalDueMinor, currency, Modifier.weight(1f))
            MoneyTile(stringResource(R.string.fees_ledger_overdue), summary.overdueMinor, currency, Modifier.weight(1f))
            MoneyTile(stringResource(R.string.fees_ledger_advance), summary.advanceMinor, currency, Modifier.weight(1f))
        }
        summary.lastPayment?.let {
            Muted(stringResource(R.string.fees_ledger_last_payment, MoneyFormat.format(it.amountMinor, currency), formatDate(it.paidOn).orEmpty()))
        }
        summary.nextDue?.let {
            Muted(stringResource(R.string.fees_ledger_next_due, MoneyFormat.format(it.amountMinor, currency), formatDate(it.dueDate).orEmpty()))
        }
    }
}

@Composable
private fun LedgerRow(entry: LedgerEntry, currency: String) {
    AppCard(Modifier.fillMaxWidth(), contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(entry.description, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                Muted(listOfNotNull(formatDate(entry.date), entry.type?.let(::humanizeKey), entry.reference).joinToString(" · "))
            }
            Column(horizontalAlignment = androidx.compose.ui.Alignment.End) {
                MoneyText(entry.amountMinor, currency = currency, color = if (entry.amountMinor < 0) AppColors.Success else AppColors.TextPrimary)
                Muted(MoneyFormat.format(entry.balanceMinor, currency))
            }
        }
    }
}

@Composable
private fun Muted(text: String) = Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)

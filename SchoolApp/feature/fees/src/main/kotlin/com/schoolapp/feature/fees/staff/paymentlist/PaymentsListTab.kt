package com.schoolapp.feature.fees.staff.paymentlist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.FeesChoiceChips
import com.schoolapp.feature.fees.components.FeesDateField
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.staff.today.components.PaymentRow

/** "Payments": every payment of the branch; tapping one opens receipt / reverse / refund. */
@Composable
internal fun PaymentsListTab(
    branch: FinanceBranch,
    session: SessionContext,
    onOpenPayment: (Payment) -> Unit,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: PaymentsListViewModel = hiltViewModel(key = "fees_payment_list_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch.id) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val filter = state.filter
    val methods = listOf(SwitcherOption(ALL, stringResource(R.string.fees_pl_all_methods))) +
        PaymentMethod.entries.map { SwitcherOption(it.name, it.label()) }
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn(itemSpacing = 12.dp) {
            item(key = "search") { SearchField(state.search, viewModel::onSearch, placeholder = stringResource(R.string.fees_pl_search)) }
            item(key = "dates") {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FeesDateField(filter.from.orEmpty(), stringResource(R.string.fees_pl_from), state.today, viewModel::onFrom, Modifier.weight(1f))
                    FeesDateField(filter.to.orEmpty(), stringResource(R.string.fees_pl_to), state.today, viewModel::onTo, Modifier.weight(1f))
                }
            }
            item(key = "methods") {
                FeesChoiceChips(methods, filter.method?.name ?: ALL, { id -> viewModel.onMethod(PaymentMethod.entries.firstOrNull { it.name == id }) })
            }
            val payments = state.payments
            when {
                state.isLoading && payments == null -> item(key = "loading") { LoadingState() }
                payments == null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                payments.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.fees_pl_empty),
                        message = stringResource(R.string.fees_pl_empty_message),
                        icon = Icons.Outlined.Payments,
                        action = { AppTextButton(stringResource(R.string.fees_pl_clear), viewModel::clearFilters) },
                    )
                }
                else -> {
                    item(key = "total") {
                        Text(
                            stringResource(R.string.fees_pl_total, payments.size, MoneyFormat.format(payments.sumOf { it.amountMinor })),
                            style = MaterialTheme.typography.titleSmall,
                            color = AppColors.TextSecondary,
                        )
                    }
                    items(payments, key = { "pay_${it.id}" }) { payment ->
                        PaymentRow(payment, payment.currency, onClick = { onOpenPayment(payment) })
                    }
                }
            }
        }
    }
}

private const val ALL = "ALL"

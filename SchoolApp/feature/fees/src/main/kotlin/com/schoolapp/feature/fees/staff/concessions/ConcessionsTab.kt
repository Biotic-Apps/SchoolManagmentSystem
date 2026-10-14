package com.schoolapp.feature.fees.staff.concessions

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Discount
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
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.fees.ledger.Concession
import com.schoolapp.core.model.fees.ledger.ConcessionType
import com.schoolapp.core.model.fees.ledger.RequestStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.periodLabel

/** "Concessions": fee reductions of the branch's students; new ones go for approval. */
@Composable
internal fun ConcessionsTab(
    branch: FinanceBranch,
    session: SessionContext,
    modifier: Modifier = Modifier,
    viewModel: ConcessionsViewModel = hiltViewModel(key = "fees_concessions_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val student by viewModel.studentSearch.state.collectAsStateWithLifecycle()
    val statuses = listOf(SwitcherOption(ALL, stringResource(R.string.fees_cn_all))) +
        RequestStatus.entries.map { SwitcherOption(it.name, statusLabel(it)) }
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn(itemSpacing = 12.dp) {
            if (session.has("fees.add")) {
                item(key = "request") {
                    PrimaryButton(stringResource(R.string.fees_cn_request), viewModel::openForm, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Add)
                }
            }
            if (state.sent) item(key = "sent") { InlineMessage(stringResource(R.string.fees_cn_sent), StatusTone.Success) }
            item(key = "status") {
                FilterChipRow(statuses, state.status?.name ?: ALL, { id -> viewModel.onStatus(RequestStatus.entries.firstOrNull { it.name == id }) })
            }
            val items = state.items
            when {
                state.isLoading && items == null -> item(key = "loading") { LoadingState() }
                items == null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                items.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.fees_cn_empty),
                        message = stringResource(R.string.fees_cn_empty_message),
                        icon = Icons.Outlined.Discount,
                    )
                }
                else -> items(items, key = { "cn_${it.id}" }) { ConcessionCard(it) }
            }
        }
    }
    state.form?.let { form ->
        ConcessionFormSheet(form, state.heads, student, viewModel.studentSearch, viewModel::edit, viewModel::send, viewModel::dismissForm)
    }
}

@Composable
private fun ConcessionCard(item: Concession) {
    AppCard(Modifier.fillMaxWidth(), verticalSpacing = 4.dp) {
        SectionHeader(
            title = item.studentName,
            subtitle = listOfNotNull(item.admissionNo, item.feeHeadName ?: stringResource(R.string.fees_cn_all_fees)).joinToString(" · "),
            action = { StatusChip(statusLabel(item.status), statusTone(item.status)) },
        )
        val value = if (item.type == ConcessionType.PERCENT) {
            stringResource(R.string.fees_cn_percent_value, item.value.toInt())
        } else {
            stringResource(R.string.fees_cn_fixed_value, MoneyFormat.format(item.value))
        }
        Text(value, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        val from = periodLabel(item.from).orEmpty()
        val months = item.to?.let { stringResource(R.string.fees_cn_months, from, periodLabel(it).orEmpty()) }
            ?: stringResource(R.string.fees_cn_months_open, from)
        val estimate = item.estimateMinor?.takeIf { it > 0 }?.let { stringResource(R.string.fees_cn_estimate, MoneyFormat.format(it)) }
        Text(listOfNotNull(months, estimate).joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        Text(item.reason, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
    }
}

@Composable
private fun statusLabel(status: RequestStatus): String = stringResource(
    when (status) {
        RequestStatus.PENDING -> R.string.fees_cn_pending
        RequestStatus.APPROVED -> R.string.fees_cn_approved
        RequestStatus.REJECTED -> R.string.fees_cn_rejected
    },
)

private fun statusTone(status: RequestStatus): StatusTone = when (status) {
    RequestStatus.PENDING -> StatusTone.Warning
    RequestStatus.APPROVED -> StatusTone.Success
    RequestStatus.REJECTED -> StatusTone.Error
}

private const val ALL = "ALL"

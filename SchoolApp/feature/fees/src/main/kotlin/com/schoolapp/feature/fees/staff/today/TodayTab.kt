package com.schoolapp.feature.fees.staff.today

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.LockClock
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.today.components.CloseDayActions
import com.schoolapp.feature.fees.staff.today.components.CloseDaySheet
import com.schoolapp.feature.fees.staff.today.components.DailyCollectionCard
import com.schoolapp.feature.fees.staff.today.components.DayClosingCard
import com.schoolapp.feature.fees.staff.today.components.OverviewTiles
import com.schoolapp.feature.fees.staff.today.components.PaymentRow

@Composable
internal fun TodayTab(
    state: TodayUiState,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    onOpenPayment: ((Payment) -> Unit)? = null,
    closeActions: CloseDayActions? = null,
    onOpenCloseDay: () -> Unit = {},
) {
    val currency = MoneyFormat.DEFAULT_CURRENCY
    val hasData = state.overview != null || state.collection != null
    when {
        state.isLoading && !hasData -> LoadingState(modifier)
        state.error != null && !hasData -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                if (state.queuedPayments > 0) {
                    item(key = "queued") {
                        InlineMessage(pluralStringResource(R.plurals.fees_queued_banner, state.queuedPayments, state.queuedPayments), StatusTone.Warning)
                    }
                }
                state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                state.overview?.let { overview ->
                    item(key = "overview") {
                        OverviewTiles(overview, state.collection?.totalMinor ?: overview.todayCollectedMinor, currency)
                    }
                }
                val collection = state.collection
                if (collection != null) {
                    item(key = "collection_header") {
                        SectionHeader(title = stringResource(R.string.fees_daily_collection), subtitle = formatDate(collection.date))
                    }
                    item(key = "collection") { DailyCollectionCard(collection, currency) }
                    val closing = collection.closing
                    if (closing != null) {
                        item(key = "closed") { DayClosingCard(closing, currency) }
                    } else if (state.showCloseDay) {
                        item(key = "close_day") {
                            SecondaryButton(
                                stringResource(R.string.fees_close_day),
                                onOpenCloseDay,
                                Modifier.fillMaxWidth(),
                                leadingIcon = Icons.Outlined.LockClock,
                            )
                        }
                    }
                    item(key = "payments_header") { SectionHeader(title = stringResource(R.string.fees_payments)) }
                    if (collection.payments.isEmpty()) {
                        item(key = "payments_empty") {
                            Text(stringResource(R.string.fees_no_payments_today), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                        }
                    }
                    items(collection.payments, key = { "pay_${it.id}" }) { payment ->
                        PaymentRow(payment, currency, onClick = onOpenPayment?.let { open -> { open(payment) } })
                    }
                }
                if (onOpenApprovals != null) {
                    item(key = "approvals") {
                        AppCard {
                            Text(stringResource(R.string.fees_approvals_note), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                            AppTextButton(stringResource(R.string.fees_open_approvals), onOpenApprovals)
                        }
                    }
                }
            }
        }
    }
    val form = state.closeForm
    val collection = state.collection
    if (form != null && collection != null && closeActions != null) {
        CloseDaySheet(form, collection.date, collection.cashMinor, currency, closeActions)
    }
}

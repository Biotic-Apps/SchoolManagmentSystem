package com.schoolapp.feature.activities.list.staff

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Celebration
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTextButton
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
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.ActivityCard
import java.time.LocalDate

/** Staff activities: filters, then the paged list or the month calendar; "Propose activity" for activities.add. */
@Composable
internal fun StaffActivitiesContent(
    state: StaffActivitiesUiState,
    viewModel: StaffActivitiesViewModel,
    today: LocalDate,
    onOpenActivity: (String) -> Unit,
    onPropose: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val open: (String) -> Unit = onOpenActivity
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.list.isRefreshing, onRefresh = viewModel::refresh) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (state.canPropose) 88.dp else 16.dp)) {
                item(key = "filters") { StaffFilters(state, viewModel::onViewChange, viewModel::onTypeChange, viewModel::onStatusChange) }
                if (state.view == StaffView.LIST) listItems(state.list, viewModel, open) else calendarItems(state.month, today, viewModel, open)
            }
        }
        if (state.canPropose) {
            AppFloatingButton(
                text = stringResource(R.string.activities_propose),
                icon = Icons.Outlined.Add,
                onClick = onPropose,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}

private fun LazyListScope.listItems(list: ActivityPageState, viewModel: StaffActivitiesViewModel, onOpen: (String) -> Unit) {
    when {
        list.isLoading -> item(key = "loading") { LoadingState() }
        list.error != null && list.items.isEmpty() -> item(key = "error") { ErrorState(appErrorMessage(list.error), onRetry = viewModel::refresh) }
        list.items.isEmpty() -> item(key = "empty") { EmptyState(stringResource(R.string.activities_empty_filtered), icon = Icons.Outlined.Celebration) }
        else -> {
            items(list.items, key = { it.activity.id }) { item -> ActivityCard(item, onClick = { onOpen(item.activity.id) }) }
            if (list.hasMore) item(key = "more") { LoadMoreRow(list, viewModel::loadMore) }
        }
    }
}

private fun LazyListScope.calendarItems(month: MonthState, today: LocalDate, viewModel: StaffActivitiesViewModel, onOpen: (String) -> Unit) {
    item(key = "grid") {
        ActivityMonthGrid(month, today, onPrevious = { viewModel.onMonthChange(-1) }, onNext = { viewModel.onMonthChange(1) }, onDay = viewModel::onDaySelected)
    }
    when {
        month.isLoading -> item(key = "month_loading") { LoadingState(rows = 2) }
        month.error != null -> item(key = "month_error") { ErrorState(appErrorMessage(month.error), onRetry = viewModel::loadMonth) }
        else -> {
            item(key = "day_header") { SectionHeader(formatDate(month.selectedDay?.toString()).orEmpty()) }
            if (month.selectedItems.isEmpty()) {
                item(key = "day_empty") { InlineMessage(stringResource(R.string.activities_day_empty), StatusTone.Info) }
            }
            items(month.selectedItems, key = { "day_${it.activity.id}" }) { item -> ActivityCard(item, onClick = { onOpen(item.activity.id) }) }
        }
    }
}

@Composable
private fun LoadMoreRow(list: ActivityPageState, onLoadMore: () -> Unit) {
    val error = list.loadMoreError
    if (error != null) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(appErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.activities_retry), onClick = onLoadMore)
        }
        return
    }
    LaunchedEffect(list.page) { onLoadMore() }
    Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = AppColors.Primary) }
}

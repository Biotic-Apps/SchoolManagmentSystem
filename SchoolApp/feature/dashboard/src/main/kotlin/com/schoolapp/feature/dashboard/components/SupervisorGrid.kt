package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyGridScope
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.action
import com.schoolapp.feature.dashboard.presentationFor

/** Adaptive grid: the Today queue above the summary counts; two columns on phones, more when wider. */
@Composable
internal fun SupervisorGrid(
    state: DashboardUiState.Supervisor,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 150.dp),
            modifier = Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth(),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            fullWidth("header") { SummaryHeader(state.userName, state.scopeName) }
            if (state.showsToday) {
                fullWidth("today-title") {
                    SectionHeader(title = stringResource(R.string.dashboard_today_title), subtitle = formatDate(state.date))
                }
                state.pendingError?.let { error -> fullWidth("today-error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                items(state.tiles, key = { "pending-${it.key}" }) { tile ->
                    StatCard(
                        label = tile.labelRes?.let { stringResource(it) } ?: humanizeKey(tile.key),
                        value = tile.count.toString(),
                        icon = tile.icon,
                        tone = tile.tone,
                        onClick = tile.link.action(onOpenMenu, onOpen, canOpenMenu),
                    )
                }
                fullWidth("overview-title") { SectionHeader(title = stringResource(R.string.dashboard_overview_title)) }
            }
            state.summaryError?.let { error -> fullWidth("summary-error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            items(state.metrics, key = { "metric-${it.key}" }) { metric ->
                val presentation = presentationFor(metric.key)
                StatCard(
                    label = presentation.labelRes?.let { stringResource(it) } ?: humanizeKey(metric.key),
                    value = metric.count.toString(),
                    icon = presentation.icon,
                    tone = presentation.tone,
                    onClick = presentation.menuId?.takeIf(canOpenMenu)?.let { id -> { onOpenMenu(id) } },
                )
            }
        }
    }
}

private fun LazyGridScope.fullWidth(key: String, content: @Composable () -> Unit) {
    item(key = key, span = { GridItemSpan(maxLineSpan) }) { content() }
}

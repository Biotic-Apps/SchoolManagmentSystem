package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.lazy.grid.itemsIndexed
import com.schoolapp.core.designsystem.motion.EntranceGate
import com.schoolapp.core.designsystem.motion.gatedEntrance
import com.schoolapp.core.designsystem.motion.rememberEntranceGate
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
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.action
import com.schoolapp.feature.dashboard.presentationFor

/** Adaptive grid: the setup card (until done), the Today queue, the month's finance card, then the summary counts; two columns on phones, more when wider. */
@Composable
internal fun SupervisorGrid(
    state: DashboardUiState.Supervisor,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
    scopeBar: (@Composable () -> Unit)? = null,
) {
    val gate = rememberEntranceGate()
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 150.dp),
            modifier = Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            fullWidth("header", gate, 0) { SummaryHeader(state.userName, state.scopeName) }
            scopeBar?.let { bar -> fullWidth("scope", gate, 0) { bar() } }
            state.setup?.let { setup ->
                fullWidth("setup", gate, 1) { SetupChecklistCard(setup, onOpenMenu, onOpen, canOpenMenu) }
            }
            if (state.showsToday) {
                fullWidth("today-title", gate, 2) {
                    SectionHeader(title = stringResource(R.string.dashboard_today_title), subtitle = formatDate(state.date))
                }
                state.pendingError?.let { error -> fullWidth("today-error", gate, 2) { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                itemsIndexed(state.tiles, key = { _, tile -> "pending-${tile.key}" }) { index, tile ->
                    StatCard(
                        modifier = Modifier.animateItem().gatedEntrance(gate, TILE_ORDER + index),
                        label = tile.labelRes?.let { stringResource(it) } ?: humanizeKey(tile.key),
                        value = tile.count.toString(),
                        icon = tile.icon,
                        tone = tile.tone,
                        onClick = tile.link.action(onOpenMenu, onOpen, canOpenMenu),
                    )
                }
            }
            state.finance?.let { finance ->
                fullWidth("finance", gate, TILE_ORDER + state.tiles.size) { FinanceCard(finance, onClick = financeAction(onOpenMenu, canOpenMenu)) }
            }
            if (state.showsToday) {
                fullWidth("overview-title", gate, STAGGER_END) { SectionHeader(title = stringResource(R.string.dashboard_overview_title)) }
            }
            state.summaryError?.let { error -> fullWidth("summary-error", gate, STAGGER_END) { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            items(state.metrics, key = { "metric-${it.key}" }) { metric ->
                val presentation = presentationFor(metric.key)
                StatCard(
                    modifier = Modifier.animateItem().gatedEntrance(gate, STAGGER_END),
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

/** Finance card opens the fees menu when the role has it. */
internal fun financeAction(onOpenMenu: (String) -> Unit, canOpenMenu: (String) -> Boolean): (() -> Unit)? =
    if (canOpenMenu(MenuIds.FEES)) ({ onOpenMenu(MenuIds.FEES) }) else null

private fun LazyGridScope.fullWidth(key: String, gate: EntranceGate, order: Int, content: @Composable () -> Unit) {
    item(key = key, span = { GridItemSpan(maxLineSpan) }) {
        Box(Modifier.animateItem().gatedEntrance(gate, order)) { content() }
    }
}

private const val TILE_ORDER = 3
private const val STAGGER_END = 8

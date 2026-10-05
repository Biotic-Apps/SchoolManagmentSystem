package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.dashboard.presentationFor

/** Adaptive grid: two columns on phones, more as the window widens. */
@Composable
internal fun MetricGrid(
    metrics: List<DashboardMetric>,
    onOpenMenu: (String) -> Unit,
    canOpenMenu: (String) -> Boolean,
    header: @Composable () -> Unit,
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
            item(key = "header", span = { GridItemSpan(maxLineSpan) }) { header() }
            items(metrics, key = { it.key }) { metric ->
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

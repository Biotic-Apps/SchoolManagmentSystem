package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/** Width from which the parent home puts more side by side (tablets, unfolded foldables, desktop windows). */
internal val WideLayoutWidth: Dp = 600.dp

private val Gap = 12.dp

/**
 * Lays [count] equal-height cells in rows: [narrowColumns] per row on phones, [wideColumns] from [WideLayoutWidth].
 * A short last row keeps the cell width by padding with empty space.
 */
@Composable
internal fun AdaptiveCells(
    count: Int,
    modifier: Modifier = Modifier,
    narrowColumns: Int = 2,
    wideColumns: Int = 4,
    cell: @Composable RowScope.(index: Int, cellModifier: Modifier) -> Unit,
) {
    BoxWithConstraints(modifier.fillMaxWidth()) {
        val columns = if (maxWidth >= WideLayoutWidth) wideColumns else narrowColumns
        Column(verticalArrangement = Arrangement.spacedBy(Gap)) {
            (0 until count).chunked(columns).forEach { row ->
                Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(Gap)) {
                    row.forEach { index -> cell(index, Modifier.weight(1f)) }
                    repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

/** Two cards side by side on wide windows, stacked on phones. */
@Composable
internal fun AdaptivePair(
    first: @Composable (Modifier) -> Unit,
    second: @Composable (Modifier) -> Unit,
    modifier: Modifier = Modifier,
) {
    BoxWithConstraints(modifier.fillMaxWidth()) {
        if (maxWidth >= WideLayoutWidth) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(Gap)) {
                first(Modifier.weight(1f))
                second(Modifier.weight(1f))
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(Gap)) {
                first(Modifier.fillMaxWidth())
                second(Modifier.fillMaxWidth())
            }
        }
    }
}

package com.schoolapp.core.designsystem.component

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.unit.Constraints
import kotlin.math.roundToInt

/**
 * [header] above [content] that scrolls away with it, for bodies (pagers, grids) whose list can't host the header
 * as an item. Scrolling up first slides the header off; it comes back once the inner list is at its top, so the
 * page still behaves as one scroll. Wrap it in [RefreshBox] for pull-to-refresh.
 */
@Composable
fun CollapsingHeaderLayout(
    header: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val collapse = remember { HeaderCollapse() }
    Layout(
        contents = listOf(header, content),
        modifier = modifier.clipToBounds().nestedScroll(collapse),
    ) { (headerMeasurables, contentMeasurables), constraints ->
        val headerPlaceables = headerMeasurables.map {
            it.measure(constraints.copy(minHeight = 0, maxHeight = Constraints.Infinity))
        }
        val headerHeight = headerPlaceables.maxOfOrNull { it.height } ?: 0
        collapse.headerHeight = headerHeight
        val offset = collapse.offset.roundToInt().coerceIn(-headerHeight, 0)
        val top = headerHeight + offset
        val contentHeight = (constraints.maxHeight - top).coerceAtLeast(0)
        val contentPlaceables = contentMeasurables.map {
            it.measure(constraints.copy(minHeight = contentHeight, maxHeight = contentHeight))
        }
        layout(constraints.maxWidth, constraints.maxHeight) {
            headerPlaceables.forEach { it.place(0, offset) }
            contentPlaceables.forEach { it.place(0, top) }
        }
    }
}

/** Header offset (0 = shown, -height = hidden), driven by the inner list's nested scroll. */
private class HeaderCollapse : NestedScrollConnection {
    var offset by mutableFloatStateOf(0f)
    var headerHeight = 0

    override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
        if (available.y >= 0f) return Offset.Zero
        return Offset(0f, moveBy(available.y))
    }

    override fun onPostScroll(consumed: Offset, available: Offset, source: NestedScrollSource): Offset {
        if (available.y <= 0f) return Offset.Zero
        return Offset(0f, moveBy(available.y))
    }

    private fun moveBy(delta: Float): Float {
        val old = offset.coerceIn(-headerHeight.toFloat(), 0f)
        val new = (old + delta).coerceIn(-headerHeight.toFloat(), 0f)
        offset = new
        return new - old
    }
}

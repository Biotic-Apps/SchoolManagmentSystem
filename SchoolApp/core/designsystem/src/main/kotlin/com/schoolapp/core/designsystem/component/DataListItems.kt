package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawOutline
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.AppRadius
import com.schoolapp.core.designsystem.theme.Borders

/**
 * Adds [items] to a page-level LazyColumn as one bordered card (rounded first/last row, dividers between), so
 * header content scrolls together with the rows instead of sitting above a small nested scrolling card.
 * Use in a column without item spacing, e.g. `ScreenColumn(itemSpacing = 0.dp)`.
 */
fun <T> LazyListScope.dataListItems(
    items: List<T>,
    key: (T) -> Any,
    emptyContent: @Composable () -> Unit = {},
    itemContent: @Composable (T) -> Unit,
) {
    if (items.isEmpty()) {
        item(contentType = "dataListEmpty") { emptyContent() }
        return
    }
    itemsIndexed(items, key = { _, item -> key(item) }, contentType = { _, _ -> "dataListRow" }) { index, item ->
        DataListCell(isFirst = index == 0, isLast = index == items.lastIndex) { itemContent(item) }
    }
}

@Composable
private fun DataListCell(isFirst: Boolean, isLast: Boolean, content: @Composable () -> Unit) {
    val radius = AppRadius.Card
    val top = if (isFirst) radius else 0.dp
    val bottom = if (isLast) radius else 0.dp
    val shape = RoundedCornerShape(topStart = top, topEnd = top, bottomStart = bottom, bottomEnd = bottom)
    Column(Modifier.fillMaxWidth().clip(shape).background(AppColors.Surface).cellBorder(isFirst, isLast, radius)) {
        content()
        if (!isLast) HorizontalDivider(color = AppColors.Border)
    }
}

/** Draws the card outline; open edges are pushed past the (clipped) bounds so adjacent cells join seamlessly. */
private fun Modifier.cellBorder(isFirst: Boolean, isLast: Boolean, radius: Dp): Modifier = drawWithContent {
    drawContent()
    val stroke = Borders.Thin.toPx()
    val overflow = radius.toPx() + stroke
    val extendTop = if (isFirst) 0f else overflow
    val extendBottom = if (isLast) 0f else overflow
    val outlineSize = Size(size.width - stroke, size.height + extendTop + extendBottom - stroke)
    val outline = RoundedCornerShape(radius).createOutline(outlineSize, layoutDirection, this)
    translate(left = stroke / 2, top = stroke / 2 - extendTop) {
        drawOutline(outline, AppColors.Border, style = Stroke(stroke))
    }
}

@Preview
@Composable
private fun DataListItemsPreview() = PreviewContainer {
    ScreenColumn(itemSpacing = 0.dp) {
        dataListItems(items = listOf("Ayesha Khan", "Bilal Ahmed", "Sara Ali"), key = { it }) { name ->
            ListItemRow(title = name, supporting = "Class 5 - Section A")
        }
    }
}

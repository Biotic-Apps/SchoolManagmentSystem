package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.Borders

/** A bordered list of rows separated by dividers; shows [emptyContent] when [items] is empty. */
@Composable
fun <T> DataList(
    items: List<T>,
    key: (T) -> Any,
    modifier: Modifier = Modifier,
    state: LazyListState = rememberLazyListState(),
    contentPadding: PaddingValues = PaddingValues(),
    emptyContent: @Composable () -> Unit = {},
    itemContent: @Composable (T) -> Unit,
) {
    if (items.isEmpty()) {
        emptyContent()
        return
    }
    Surface(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        color = AppColors.Surface,
        border = BorderStroke(Borders.Thin, AppColors.Border),
    ) {
        LazyColumn(state = state, contentPadding = contentPadding) {
            itemsIndexed(items, key = { _, item -> key(item) }) { index, item ->
                Column {
                    itemContent(item)
                    if (index < items.lastIndex) HorizontalDivider(color = AppColors.Border)
                }
            }
        }
    }
}

@Preview
@Composable
private fun DataListPreview() = PreviewContainer {
    DataList(items = listOf("Ayesha Khan", "Bilal Ahmed", "Sara Ali"), key = { it }) { name ->
        ListItemRow(title = name, supporting = "Class 5 - Section A")
    }
}

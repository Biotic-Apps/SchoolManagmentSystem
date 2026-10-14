package com.schoolapp.feature.inventory.items

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Category
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.PagedListContent
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.list.PagedList

internal class ItemsActions(
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onLoadMore: () -> Unit,
    val onSearch: (String) -> Unit,
    val onCategory: (ItemCategory?) -> Unit,
)

@Composable
internal fun ItemsTab(state: PagedList<InventoryItem>, filters: ItemFilters, actions: ItemsActions, modifier: Modifier = Modifier) {
    val categories = listOf(SwitcherOption(ALL, stringResource(R.string.inv_all))) +
        ItemCategory.entries.map { SwitcherOption(it.name, stringResource(it.label())) }
    PagedListContent(
        state = state,
        onRetry = actions.onRetry,
        onRefresh = actions.onRefresh,
        onLoadMore = actions.onLoadMore,
        key = { it.id },
        modifier = modifier,
        header = {
            item(key = "search") { SearchField(filters.search, actions.onSearch, placeholder = stringResource(R.string.inv_search_items)) }
            item(key = "category") {
                FilterChipRow(categories, filters.category?.name ?: ALL, { id ->
                    actions.onCategory(ItemCategory.entries.firstOrNull { it.name == id })
                })
            }
        },
        empty = {
            EmptyState(
                stringResource(R.string.inv_items_empty),
                message = stringResource(R.string.inv_items_empty_message),
                icon = Icons.Outlined.Category,
            )
        },
    ) { ItemRow(it) }
}

private const val ALL = "ALL"

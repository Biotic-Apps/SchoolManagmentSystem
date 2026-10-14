package com.schoolapp.feature.inventory.assets

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Chair
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.PagedListContent
import com.schoolapp.feature.inventory.list.PagedList

/** Tagged assets; [onEdit] is null when the role may not edit. */
@Composable
internal fun AssetsTab(
    state: PagedList<Asset>,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onLoadMore: () -> Unit,
    onEdit: ((Asset) -> Unit)?,
    modifier: Modifier = Modifier,
) {
    PagedListContent(
        state = state,
        onRetry = onRetry,
        onRefresh = onRefresh,
        onLoadMore = onLoadMore,
        key = { it.id },
        modifier = modifier,
        empty = {
            EmptyState(
                stringResource(R.string.inv_assets_empty),
                message = stringResource(R.string.inv_assets_empty_message),
                icon = Icons.Outlined.Chair,
            )
        },
    ) { asset -> AssetRow(asset, onClick = onEdit?.let { edit -> { edit(asset) } }) }
}

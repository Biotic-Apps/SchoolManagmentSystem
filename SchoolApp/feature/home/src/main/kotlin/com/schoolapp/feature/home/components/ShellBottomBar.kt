package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.navigation.MenuItem
import com.schoolapp.core.navigation.NavigationCatalog
import com.schoolapp.feature.home.R

/**
 * Phone navigation: at most four role destinations with one-word labels plus "More", which is shown
 * selected while one of the sheet's destinations is open.
 */
@Composable
internal fun ShellBottomBar(
    items: List<MenuItem>,
    selectedId: String?,
    hasMore: Boolean,
    moreSelected: Boolean,
    onSelect: (String) -> Unit,
    onMore: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = NavigationBarItemDefaults.colors(
        selectedIconColor = AppColors.OnSelected,
        selectedTextColor = AppColors.OnSelected,
        indicatorColor = AppColors.Selected,
        unselectedIconColor = AppColors.TextSecondary,
        unselectedTextColor = AppColors.TextSecondary,
    )
    Column(modifier) {
        HorizontalDivider(color = AppColors.Border)
        NavigationBar(containerColor = AppColors.Surface, tonalElevation = NoElevation) {
            items.forEach { item ->
                NavigationBarItem(
                    selected = item.id == selectedId,
                    onClick = { onSelect(item.id) },
                    icon = { NavIcon(item.icon) },
                    label = { Text(item.shortLabel, maxLines = 1, softWrap = false, overflow = TextOverflow.Clip) },
                    alwaysShowLabel = true,
                    colors = colors,
                )
            }
            if (hasMore) {
                NavigationBarItem(
                    selected = moreSelected,
                    onClick = onMore,
                    icon = { NavIcon(Icons.Outlined.MoreHoriz) },
                    label = { Text(stringResource(R.string.home_more), maxLines = 1, softWrap = false) },
                    alwaysShowLabel = true,
                    colors = colors,
                )
            }
        }
    }
}

@Preview
@Composable
private fun ShellBottomBarPreview() = SchoolTheme {
    val items = NavigationCatalog.entries.take(4)
    ShellBottomBar(items, items.first().id, hasMore = true, moreSelected = false, onSelect = {}, onMore = {})
}

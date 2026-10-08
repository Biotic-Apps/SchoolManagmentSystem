package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.navigation.MenuItem
import com.schoolapp.core.navigation.NavigationCatalog

/** Tablet / landscape navigation: every destination of the role, selected one in the teal indicator. */
@Composable
internal fun ShellNavigationRail(
    items: List<MenuItem>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = NavigationRailItemDefaults.colors(
        selectedIconColor = AppColors.OnSelected,
        selectedTextColor = AppColors.OnSelected,
        indicatorColor = AppColors.Selected,
        unselectedIconColor = AppColors.TextSecondary,
        unselectedTextColor = AppColors.TextSecondary,
    )
    Row(modifier.fillMaxHeight()) {
        NavigationRail(containerColor = AppColors.Surface) {
            // Every destination, scrollable so all stay reachable on short (landscape) screens; no "More".
            Column(Modifier.verticalScroll(rememberScrollState())) {
                items.forEach { item ->
                    NavigationRailItem(
                        selected = item.id == selectedId,
                        onClick = { onSelect(item.id) },
                        icon = { NavIcon(item.icon) },
                        label = {
                            Text(item.shortLabel, maxLines = 2, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center)
                        },
                        colors = colors,
                    )
                }
            }
        }
        VerticalDivider(color = AppColors.Border)
    }
}

@Preview(heightDp = 640)
@Composable
private fun ShellNavigationRailPreview() = SchoolTheme {
    val items = NavigationCatalog.entries.take(12)
    ShellNavigationRail(items, items.first().id, onSelect = {})
}

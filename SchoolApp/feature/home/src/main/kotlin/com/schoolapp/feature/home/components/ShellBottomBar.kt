package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.navigation.MenuItem
import com.schoolapp.core.navigation.NavigationCatalog

/**
 * Phone navigation: the role's four most used destinations with one-word labels. Everything else is in
 * the navigation drawer (menu icon in the top bar); no item is selected while a drawer-only screen is open.
 */
@Composable
internal fun ShellBottomBar(
    items: List<MenuItem>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = NavigationBarItemDefaults.colors(
        selectedIconColor = AppColors.OnSelected,
        selectedTextColor = AppColors.OnSelected,
        indicatorColor = AppColors.Selected,
        unselectedIconColor = AppColors.TextSecondary,
        unselectedTextColor = AppColors.TextSecondary,
    )
    Column(modifier.shadow(3.dp, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp), clip = false)) {
        NavigationBar(containerColor = AppColors.Surface, tonalElevation = 0.dp) {
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
        }
    }
}

@Preview
@Composable
private fun ShellBottomBarPreview() = SchoolTheme {
    val items = NavigationCatalog.entries.take(4)
    ShellBottomBar(items, items.first().id, onSelect = {})
}

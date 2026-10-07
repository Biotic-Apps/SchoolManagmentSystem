package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.PermanentDrawerSheet
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.navigation.MenuItem
import com.schoolapp.core.navigation.NavigationCatalog

@Composable
internal fun ShellDrawerSheet(
    items: List<MenuItem>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = NavigationDrawerItemDefaults.colors(
        selectedContainerColor = AppColors.Selected,
        selectedIconColor = AppColors.OnSelected,
        selectedTextColor = AppColors.OnSelected,
        unselectedContainerColor = AppColors.Surface,
        unselectedIconColor = AppColors.TextSecondary,
        unselectedTextColor = AppColors.TextPrimary,
    )
    Row(modifier.fillMaxHeight()) {
        PermanentDrawerSheet(
            modifier = Modifier.width(280.dp),
            drawerContainerColor = AppColors.Surface,
            drawerTonalElevation = NoElevation,
        ) {
            LazyColumn(contentPadding = PaddingValues(12.dp)) {
                items(items, key = { it.id }) { item ->
                    NavigationDrawerItem(
                        label = {
                            Text(
                                item.label,
                                style = MaterialTheme.typography.labelMedium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        },
                        icon = { NavIcon(item.icon) },
                        selected = item.id == selectedId,
                        onClick = { onSelect(item.id) },
                        shape = MaterialTheme.shapes.small,
                        colors = colors,
                        modifier = Modifier.padding(vertical = 2.dp),
                    )
                }
            }
        }
        VerticalDivider(color = AppColors.Border)
    }
}

@Preview(heightDp = 640)
@Composable
private fun ShellDrawerSheetPreview() = SchoolTheme {
    val items = NavigationCatalog.entries.take(10)
    ShellDrawerSheet(items, items[2].id, onSelect = {})
}

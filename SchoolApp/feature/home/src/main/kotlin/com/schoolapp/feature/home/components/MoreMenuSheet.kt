package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.navigation.MenuGroup
import com.schoolapp.core.navigation.MenuGroups
import com.schoolapp.core.navigation.MenuItem
import com.schoolapp.feature.home.R

/**
 * "More": the role's remaining destinations as a grid of tiles grouped under small headings, with the
 * account group (profile, settings) and Sign out last. Scrolls; the drag handle and back dismiss it.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun MoreMenuSheet(
    items: List<MenuItem>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
    onLogout: () -> Unit,
) {
    val groups = MenuGroups.group(items)
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false),
        containerColor = AppColors.Surface,
    ) {
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 96.dp),
            contentPadding = PaddingValues(start = 12.dp, end = 12.dp, bottom = 16.dp),
            modifier = Modifier.navigationBarsPadding(),
        ) {
            groups.forEach { (group, groupItems) ->
                item(key = "h-${group.name}", span = { GridItemSpan(maxLineSpan) }) { GroupHeading(group) }
                items(groupItems, key = { it.id }) { item ->
                    MoreTile(item.label, item.icon, selected = item.id == selectedId, onClick = { onSelect(item.id) })
                }
            }
            if (groups.none { it.first == MenuGroup.ACCOUNT }) {
                item(key = "h-account", span = { GridItemSpan(maxLineSpan) }) { GroupHeading(MenuGroup.ACCOUNT) }
            }
            item(key = "logout") {
                MoreTile(stringResource(R.string.home_logout), Icons.AutoMirrored.Outlined.Logout, selected = false, onClick = onLogout, destructive = true)
            }
        }
    }
}

@Composable
private fun GroupHeading(group: MenuGroup) {
    val title = when (group) {
        MenuGroup.DAILY -> R.string.home_group_daily
        MenuGroup.PEOPLE -> R.string.home_group_people
        MenuGroup.COMMUNICATION -> R.string.home_group_communication
        MenuGroup.FINANCE -> R.string.home_group_finance
        MenuGroup.SCHOOL -> R.string.home_group_school
        MenuGroup.ACCOUNT -> R.string.home_group_account
    }
    Text(
        text = stringResource(title),
        style = MaterialTheme.typography.labelMedium,
        color = AppColors.TextSecondary,
        modifier = Modifier.padding(start = 4.dp, top = 16.dp, bottom = 4.dp),
    )
}

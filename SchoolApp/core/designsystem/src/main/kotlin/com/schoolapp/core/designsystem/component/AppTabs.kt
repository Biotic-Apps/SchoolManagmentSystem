package com.schoolapp.core.designsystem.component

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTabs(
    titles: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    PrimaryScrollableTabRow(
        selectedTabIndex = selectedIndex,
        modifier = modifier,
        containerColor = AppColors.Surface,
        contentColor = AppColors.Primary,
        edgePadding = 16.dp,
        indicator = {
            TabRowDefaults.PrimaryIndicator(
                modifier = Modifier.tabIndicatorOffset(selectedIndex, matchContentSize = true),
                color = AppColors.Primary,
            )
        },
        divider = { HorizontalDivider(color = AppColors.Border) },
    ) {
        titles.forEachIndexed { index, title ->
            Tab(
                selected = index == selectedIndex,
                onClick = { onSelect(index) },
                text = { Text(title) },
                selectedContentColor = AppColors.Primary,
                unselectedContentColor = AppColors.TextSecondary,
            )
        }
    }
}

@Preview
@Composable
private fun AppTabsPreview() = PreviewContainer {
    AppTabs(titles = listOf("Sections", "Classes", "Subjects"), selectedIndex = 0, onSelect = {})
}

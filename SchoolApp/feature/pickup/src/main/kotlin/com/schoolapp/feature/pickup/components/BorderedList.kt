package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors

/** Short non-lazy list inside one bordered card, rows separated by dividers. */
@Composable
internal fun <T> BorderedList(items: List<T>, modifier: Modifier = Modifier, row: @Composable (T) -> Unit) {
    AppCard(modifier, contentPadding = 0.dp) {
        items.forEachIndexed { index, item ->
            Column {
                row(item)
                if (index < items.lastIndex) HorizontalDivider(color = AppColors.Border)
            }
        }
    }
}

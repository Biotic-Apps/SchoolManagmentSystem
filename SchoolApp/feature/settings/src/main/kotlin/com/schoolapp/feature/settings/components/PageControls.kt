package com.schoolapp.feature.settings.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** "Page 2 of 5 · 93 total" with previous/next buttons; hidden when everything fits on one page. */
@Composable
internal fun PageControls(
    page: Int,
    pageSize: Int,
    total: Int,
    onPage: (Int) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val pages = ((total + pageSize - 1) / pageSize).coerceAtLeast(1)
    if (pages <= 1) return
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        IconButton(onClick = { onPage(page - 1) }, enabled = enabled && page > 1) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowLeft, contentDescription = stringResource(R.string.settings_page_previous))
        }
        Text(
            text = stringResource(R.string.settings_page_of, page, pages, total),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        IconButton(onClick = { onPage(page + 1) }, enabled = enabled && page < pages) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = stringResource(R.string.settings_page_next))
        }
    }
}

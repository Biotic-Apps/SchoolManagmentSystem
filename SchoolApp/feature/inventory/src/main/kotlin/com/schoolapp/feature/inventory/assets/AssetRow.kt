package com.schoolapp.feature.inventory.assets

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Chair
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.label
import com.schoolapp.feature.inventory.components.tone

/** Tag, item, location, condition and assignee; tappable to edit when [onClick] is set. */
@Composable
internal fun AssetRow(asset: Asset, onClick: (() -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier, onClick = onClick) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            IconTile(Icons.Outlined.Chair, StatusTone.Neutral)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(asset.tag, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                Text(asset.item.name, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                Text(asset.location, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                asset.assignedTo?.let {
                    Text(stringResource(R.string.inv_assigned_line, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            asset.condition?.let { StatusChip(stringResource(it.label()), it.tone()) }
        }
    }
}

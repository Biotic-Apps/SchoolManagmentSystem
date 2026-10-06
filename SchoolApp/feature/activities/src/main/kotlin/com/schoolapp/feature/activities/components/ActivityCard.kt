package com.schoolapp.feature.activities.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.HowToReg
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.list.ActivityItem

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ActivityCard(item: ActivityItem, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val activity = item.activity
    AppCard(modifier = modifier, onClick = onClick) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Box(
                modifier = Modifier.size(40.dp).background(AppColors.Selected, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(activity.type.icon(), contentDescription = stringResource(activity.type.labelRes()), tint = AppColors.Primary, modifier = Modifier.size(22.dp))
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(activity.title, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(item.timeRange, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                activity.venue?.takeIf { it.isNotBlank() }?.let {
                    Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusChip(stringResource(activity.status.labelRes()), activity.status.tone())
                    if (item.consentNeeded) {
                        StatusChip(stringResource(R.string.activities_consent_needed), StatusTone.Warning, icon = Icons.Outlined.HowToReg)
                    }
                }
            }
        }
    }
}

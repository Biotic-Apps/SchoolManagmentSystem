package com.schoolapp.feature.complaints.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.complaint.ComplaintUpdate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.complaints.R

/** Vertical line with a dot per update: author, 12-hour time, message and any status change. */
@Composable
internal fun StatusTimeline(updates: List<ComplaintUpdate>, modifier: Modifier = Modifier) {
    Column(modifier) {
        updates.forEachIndexed { index, update ->
            TimelineEntry(update, isFirst = index == 0, isLast = index == updates.lastIndex)
        }
    }
}

@Composable
private fun TimelineEntry(update: ComplaintUpdate, isFirst: Boolean, isLast: Boolean) {
    Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(Modifier.width(16.dp).fillMaxHeight(), contentAlignment = Alignment.TopCenter) {
            Column(Modifier.fillMaxHeight(), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.width(2.dp).height(DotTop).background(if (isFirst) AppColors.Surface else AppColors.Border))
                Box(Modifier.width(2.dp).weight(1f).background(if (isLast) AppColors.Surface else AppColors.Border))
            }
            Box(
                Modifier
                    .padding(top = DotTop - DotSize / 2)
                    .size(DotSize)
                    .clip(CircleShape)
                    .background(update.status?.let { AppColors.Primary } ?: AppColors.TextSecondary),
            )
        }
        Column(Modifier.weight(1f).padding(bottom = if (isLast) 0.dp else 16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = update.authorName ?: stringResource(R.string.complaints_system),
                style = MaterialTheme.typography.labelLarge,
                color = AppColors.TextPrimary,
            )
            formatTimestamp(update.at)?.let {
                Text(it, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
            }
            if (update.message.isNotBlank()) {
                Text(update.message, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            }
            update.status?.let { StatusChip(stringResource(R.string.complaints_status_changed, statusLabel(it)), it.tone()) }
        }
    }
}

private val DotTop = 10.dp
private val DotSize = 10.dp

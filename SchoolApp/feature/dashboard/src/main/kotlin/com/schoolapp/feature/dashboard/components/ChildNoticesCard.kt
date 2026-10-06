package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.dashboard.R

/** Latest notices (pinned first); the card opens the full notices feed. */
@Composable
internal fun ChildNoticesCard(notices: List<Notice>, onOpenAll: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onOpenAll) {
        SectionHeader(
            title = stringResource(R.string.dashboard_notices_title),
            action = { AppTextButton(stringResource(R.string.dashboard_view_all), onOpenAll) },
        )
        if (notices.isEmpty()) {
            Text(
                stringResource(R.string.dashboard_notices_empty),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        notices.forEachIndexed { index, notice ->
            if (index > 0) HorizontalDivider(Modifier.padding(vertical = 8.dp), color = AppColors.Border)
            NoticeBlock(notice)
        }
    }
}

@Composable
private fun NoticeBlock(notice: Notice) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(
                notice.title,
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            if (notice.pinned) StatusChip(stringResource(R.string.dashboard_notice_pinned), StatusTone.Info)
        }
        Text(
            notice.body,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        formatTimestamp(notice.publishedAt)?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

package com.schoolapp.feature.diary.supervisor

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.RateReview
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.diary.R

/** Sections with timetable subjects that have no published diary for the day. */
@Composable
internal fun MissingDiariesCard(groups: List<MissingGroup>, modifier: Modifier = Modifier) {
    AppCard(modifier, contentPadding = 0.dp) {
        if (groups.isEmpty()) {
            Text(
                stringResource(R.string.diary_missing_none),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.Success,
                modifier = Modifier.padding(16.dp),
            )
        }
        groups.forEachIndexed { index, group ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(group.title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                Text(
                    group.subjects.joinToString(", ").ifBlank { stringResource(R.string.diary_subject_unknown) },
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
                StatusChip(
                    stringResource(R.string.diary_missing_count, group.subjects.size.coerceAtLeast(1)),
                    StatusTone.Warning,
                )
            }
        }
    }
}

/** Entry point to the approvals inbox, where moderated diaries wait. */
@Composable
internal fun ModerationCard(onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier, onClick = onClick, contentPadding = 0.dp) {
        ListItemRow(
            title = stringResource(R.string.diary_waiting_review),
            supporting = stringResource(R.string.diary_waiting_review_supporting),
            leadingIcon = Icons.Outlined.RateReview,
            onClick = onClick,
            trailing = { Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = null, tint = AppColors.TextSecondary) },
        )
    }
}

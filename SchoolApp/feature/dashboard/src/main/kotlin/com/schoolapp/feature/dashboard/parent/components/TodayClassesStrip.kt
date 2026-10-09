package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.TodayPeriod

/** Today's periods as a swipeable strip (time, subject, teacher); the running period is highlighted. */
@Composable
internal fun TodayClassesStrip(periods: List<TodayPeriod>, onOpenTimetable: (() -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        SectionHeader(
            title = stringResource(R.string.dashboard_today_classes),
            modifier = Modifier.padding(start = 16.dp, end = 8.dp, top = 8.dp),
            action = onOpenTimetable?.let { open -> { AppTextButton(stringResource(R.string.dashboard_open_timetable), open) } },
        )
        if (periods.isEmpty()) {
            CardEmptyHint(
                title = stringResource(R.string.dashboard_no_classes_today),
                hint = stringResource(R.string.dashboard_no_classes_hint),
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
            )
        } else {
            LazyRow(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(periods, key = { it.periodIndex }) { PeriodChip(it) }
            }
        }
    }
}

@Composable
private fun PeriodChip(period: TodayPeriod) {
    AppCard(Modifier.width(148.dp), selected = period.isCurrent, contentPadding = 12.dp, verticalSpacing = 2.dp) {
        Text(period.timeRange, style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary, maxLines = 1)
        Text(
            period.title.ifBlank { stringResource(R.string.dashboard_diary_general) },
            style = MaterialTheme.typography.titleSmall,
            color = if (period.isPast) AppColors.TextSecondary else AppColors.TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        period.subtitle?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        val chip = when {
            period.isCurrent -> R.string.dashboard_now to StatusTone.Success
            period.isNext -> R.string.dashboard_next to StatusTone.Info
            period.isSubstitute -> R.string.dashboard_substitute to StatusTone.Warning
            else -> null
        }
        chip?.let { (label, tone) -> Row(Modifier.padding(top = 4.dp)) { StatusChip(stringResource(label), tone) } }
    }
}

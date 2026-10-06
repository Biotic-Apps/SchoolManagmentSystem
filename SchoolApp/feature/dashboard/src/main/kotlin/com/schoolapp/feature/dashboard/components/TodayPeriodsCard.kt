package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.TodayPeriod

@Composable
internal fun TodayPeriodsCard(
    periods: List<TodayPeriod>,
    onOpenTimetable: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.dashboard_today_periods),
            action = onOpenTimetable?.let { open -> { AppTextButton(stringResource(R.string.dashboard_open_timetable), open) } },
        )
        if (periods.isEmpty()) {
            Text(stringResource(R.string.dashboard_no_periods_today), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        periods.forEach { period ->
            ListItemRow(
                title = listOf(period.timeRange, period.title).filter { it.isNotBlank() }.joinToString(" · "),
                supporting = period.subtitle,
                leadingIcon = Icons.Outlined.Schedule,
                selected = period.isCurrent,
                trailing = {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (period.isCurrent) StatusChip(stringResource(R.string.dashboard_now), StatusTone.Success)
                        if (period.isSubstitute) StatusChip(stringResource(R.string.dashboard_substitute), StatusTone.Warning)
                    }
                },
            )
        }
    }
}

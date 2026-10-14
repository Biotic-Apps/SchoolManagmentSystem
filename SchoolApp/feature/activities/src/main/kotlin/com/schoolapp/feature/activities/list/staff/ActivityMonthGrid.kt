package com.schoolapp.feature.activities.list.staff

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.activities.R
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

/** Month header with previous / next, then a Monday-first grid; days with activities carry a dot and a count label. */
@Composable
internal fun ActivityMonthGrid(
    month: MonthState,
    today: LocalDate,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    onDay: (LocalDate) -> Unit,
    modifier: Modifier = Modifier,
) {
    val first = month.month.atDay(1)
    val cells: List<LocalDate?> = List(first.dayOfWeek.value - 1) { null } + (1..month.month.lengthOfMonth()).map(month.month::atDay)
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onPrevious) {
                    Icon(Icons.AutoMirrored.Outlined.KeyboardArrowLeft, stringResource(R.string.activities_previous_month), tint = AppColors.Primary)
                }
                Text(
                    "${month.month.month.getDisplayName(TextStyle.FULL, Locale.ENGLISH)} ${month.month.year}",
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f),
                )
                IconButton(onClick = onNext) {
                    Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, stringResource(R.string.activities_next_month), tint = AppColors.Primary)
                }
            }
            Row(Modifier.fillMaxWidth()) {
                DayOfWeek.entries.forEach { day ->
                    Text(
                        day.getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        style = MaterialTheme.typography.labelSmall,
                        color = AppColors.TextSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            cells.chunked(DAYS_IN_WEEK).forEach { week ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    week.forEach { date ->
                        if (date == null) {
                            Spacer(Modifier.weight(1f))
                        } else {
                            DayCell(date, month.byDay[date]?.size ?: 0, date == month.selectedDay, date == today, { onDay(date) }, Modifier.weight(1f))
                        }
                    }
                    repeat(DAYS_IN_WEEK - week.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

@Composable
private fun DayCell(date: LocalDate, count: Int, selected: Boolean, isToday: Boolean, onClick: () -> Unit, modifier: Modifier) {
    val shape = RoundedCornerShape(8.dp)
    val label = stringResource(R.string.activities_day_count, date.dayOfMonth, count)
    Box(
        modifier
            .aspectRatio(1f)
            .background(if (selected) AppColors.Selected else AppColors.Surface, shape)
            .then(if (isToday) Modifier.border(1.dp, AppColors.Primary, shape) else Modifier)
            .clickable(onClick = onClick)
            .semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(date.dayOfMonth.toString(), style = MaterialTheme.typography.bodySmall, color = if (selected) AppColors.Primary else AppColors.TextPrimary)
            if (count > 0) Box(Modifier.size(6.dp).background(AppColors.Primary, CircleShape))
        }
    }
}

private const val DAYS_IN_WEEK = 7

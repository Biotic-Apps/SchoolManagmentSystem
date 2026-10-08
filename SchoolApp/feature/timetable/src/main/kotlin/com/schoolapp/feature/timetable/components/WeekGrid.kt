package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.DayPlan
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.RowKind
import com.schoolapp.feature.timetable.ScheduleRow

private val CellWidth = 132.dp
private val CellHeight = 64.dp
private val HeaderWidth = 112.dp

/** Wide screens: the whole week as a compact grid (rows = periods, columns = days); lessons open the sheet. */
@Composable
internal fun WeekGrid(days: List<DayPlan>, today: Int?, onOpen: (ScheduleRow) -> Unit, modifier: Modifier = Modifier) {
    val dayNames = stringArrayResource(R.array.timetable_days_short)
    val indexes = days.flatMap { plan -> plan.rows.map { it.periodIndex } }.distinct().sorted()
    val reference = indexes.associateWith { index -> days.firstNotNullOfOrNull { plan -> plan.rows.firstOrNull { it.periodIndex == index } } }
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).horizontalScroll(rememberScrollState()).padding(16.dp)) {
        Row {
            Cell(HeaderWidth) {}
            days.forEach { plan ->
                Cell(CellWidth, highlighted = plan.day == today) {
                    val date = plan.date?.dayOfMonth?.let { " $it" }.orEmpty()
                    Text(dayNames.getOrElse(plan.day - 1) { "" } + date, style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
                }
            }
        }
        indexes.forEach { index ->
            Row {
                Cell(HeaderWidth) {
                    reference[index]?.let { row ->
                        Text(
                            if (row.isBreak) row.title.ifBlank { stringResource(R.string.timetable_break) } else periodCaption(row.copy(timeRange = "")),
                            style = MaterialTheme.typography.labelMedium,
                            color = AppColors.TextPrimary,
                        )
                        Text(row.timeRange, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
                    }
                }
                days.forEach { plan ->
                    val rows = plan.rows.filter { it.periodIndex == index }
                    val lesson = rows.firstOrNull { it.kind == RowKind.LESSON }
                    Cell(CellWidth, highlighted = plan.day == today, onClick = lesson?.let { { onOpen(it) } }) {
                        when {
                            lesson != null -> {
                                Text(lesson.title, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text(
                                    listOfNotNull(lesson.subtitle, lesson.room).joinToString(" · "),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = AppColors.TextSecondary,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                )
                            }
                            rows.any { it.isBreak } -> Text(stringResource(R.string.timetable_break), style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
                            rows.isNotEmpty() -> Text(stringResource(R.string.timetable_free), style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
                            else -> Text("—", style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Cell(width: androidx.compose.ui.unit.Dp, highlighted: Boolean = false, onClick: (() -> Unit)? = null, content: @Composable () -> Unit) {
    val base = Modifier
        .width(width)
        .height(CellHeight)
        .border(0.5.dp, AppColors.Border)
        .background(if (highlighted) AppColors.Selected else AppColors.Surface)
    Column(
        modifier = (if (onClick != null) base.clickable(onClick = onClick) else base).padding(6.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) { content() }
}

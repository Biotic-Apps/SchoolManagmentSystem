package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.DayPlan
import com.schoolapp.feature.timetable.DayStatus
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.RowMarker
import com.schoolapp.feature.timetable.ScheduleRow

/** One day as a vertical timeline with a "N lessons today" summary; always scrollable for pull-to-refresh. */
@Composable
internal fun DayTimeline(
    plan: DayPlan,
    isToday: Boolean,
    markerFor: (ScheduleRow) -> RowMarker?,
    onOpen: (ScheduleRow) -> Unit,
    modifier: Modifier = Modifier,
    header: @Composable () -> Unit = {},
) {
    val dayName = stringArrayResource(R.array.timetable_days_long).getOrElse(plan.day - 1) { "" }
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        LazyColumn(
            modifier = Modifier.widthIn(max = ContentMaxWidth).fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            item(key = "header") { header() }
            if (plan.status != DayStatus.LESSONS) {
                item(key = "empty") { DayEmptyState(plan, isToday) }
            } else {
                item(key = "summary") {
                    Row(Modifier.fillMaxWidth()) {
                        val count = plan.lessonCount
                        Text(
                            text = if (isToday) {
                                pluralStringResource(R.plurals.timetable_lessons_today, count, count)
                            } else {
                                pluralStringResource(R.plurals.timetable_lessons_on, count, count, dayName)
                            },
                            style = MaterialTheme.typography.titleSmall,
                            color = AppColors.TextPrimary,
                        )
                    }
                }
                itemsIndexed(plan.rows, key = { i, row -> "${row.key}-$i" }) { _, row -> TimelineRow(row, markerFor(row), onOpen) }
            }
        }
    }
}

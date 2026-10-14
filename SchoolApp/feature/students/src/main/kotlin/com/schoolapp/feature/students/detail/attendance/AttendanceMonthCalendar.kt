package com.schoolapp.feature.students.detail.attendance

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.ui.formatDate
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.Locale

/** Month grid (Monday first); [statuses] maps `YYYY-MM-DD` to the mark; days after [today] stay blank. */
@Composable
internal fun AttendanceMonthCalendar(
    month: YearMonth,
    statuses: Map<String, AttendanceStatus?>,
    today: String,
    modifier: Modifier = Modifier,
) {
    val todayDate = runCatching { LocalDate.parse(today) }.getOrNull()
    val leading = month.atDay(1).dayOfWeek.value - 1
    val cells: List<LocalDate?> = List(leading) { null } + (1..month.lengthOfMonth()).map(month::atDay)
    AppCard(modifier.fillMaxWidth()) {
        Column(Modifier.widthIn(max = MAX_GRID_WIDTH.dp).align(Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(4.dp)) {
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
                            val key = date.toString()
                            val future = todayDate != null && date.isAfter(todayDate)
                            DayCell(date, statuses[key], marked = key in statuses, future, date == todayDate, Modifier.weight(1f))
                        }
                    }
                    repeat(DAYS_IN_WEEK - week.size) { Spacer(Modifier.weight(1f)) }
                }
            }
            Legend()
        }
    }
}

@Composable
private fun DayCell(date: LocalDate, status: AttendanceStatus?, marked: Boolean, future: Boolean, isToday: Boolean, modifier: Modifier) {
    val colors = status.markColors()
    val label = if (marked || !future) attendanceLabel(status) else ""
    val shape = RoundedCornerShape(8.dp)
    Box(
        modifier
            .aspectRatio(1f)
            .background(if (future) AppColors.Surface else colors.container, shape)
            .then(if (isToday) Modifier.border(1.dp, AppColors.Primary, shape) else Modifier)
            .clearAndSetSemantics { contentDescription = listOfNotNull(formatDate(date.toString()), label.ifBlank { null }).joinToString(": ") },
        contentAlignment = Alignment.Center,
    ) {
        Text(date.dayOfMonth.toString(), style = MaterialTheme.typography.bodySmall, color = if (future) AppColors.TextSecondary else colors.content)
    }
}

@Composable
private fun Legend() {
    val items = listOf(AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.LEAVE, AttendanceStatus.HALF_DAY, null)
    items.chunked(LEGEND_COLUMNS).forEach { row ->
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            row.forEach { status ->
                Row(Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(10.dp).background(status.markColors().content, CircleShape))
                    Spacer(Modifier.size(4.dp))
                    Text(attendanceLabel(status), style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

private const val DAYS_IN_WEEK = 7
private const val LEGEND_COLUMNS = 3
private const val MAX_GRID_WIDTH = 480

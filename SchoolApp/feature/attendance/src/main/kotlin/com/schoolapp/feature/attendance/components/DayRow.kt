package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.ui.formatDate
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

/** A dated attendance line: "Mon, 5 Oct 2026" with the mark chip and optional detail lines. */
@Composable
internal fun DayRow(date: String, status: AttendanceStatus?, details: List<String>, modifier: Modifier = Modifier) {
    AppCard(modifier, contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(dayLabel(date), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                details.forEach { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
            }
            Spacer(Modifier.width(8.dp))
            StatusChip(attendanceStatusLabel(status), status.tone())
        }
    }
}

private fun dayLabel(date: String): String {
    val weekday = runCatching { LocalDate.parse(date).dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH) }.getOrNull()
    return listOfNotNull(weekday, formatDate(date)).joinToString(", ")
}

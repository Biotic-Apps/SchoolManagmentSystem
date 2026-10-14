package com.schoolapp.feature.admin.schools.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import java.time.DayOfWeek
import java.time.format.TextStyle
import java.util.Locale

/** Mon … Sun toggles; [days] are ISO 1 (Mon) … 7 (Sun). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun WeekdayChips(label: String, days: List<Int>, onChange: (List<Int>) -> Unit, modifier: Modifier = Modifier, error: String? = null) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            DayOfWeek.entries.forEach { day ->
                val iso = day.value
                val selected = iso in days
                FilterChip(
                    selected = selected,
                    onClick = { onChange(if (selected) days - iso else (days + iso).sorted()) },
                    label = { Text(day.getDisplayName(TextStyle.SHORT, Locale.ENGLISH)) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.Selected,
                        selectedLabelColor = AppColors.OnSelected,
                    ),
                )
            }
        }
        error?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
    }
}

/** "Mon–Sat" style text for the review step. */
internal fun weekdaysText(days: List<Int>): String =
    days.sorted().joinToString(", ") { DayOfWeek.of(it).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) }

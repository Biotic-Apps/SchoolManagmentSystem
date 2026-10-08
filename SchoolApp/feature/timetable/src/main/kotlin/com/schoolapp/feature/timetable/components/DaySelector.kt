package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.DayPlan
import com.schoolapp.feature.timetable.R

/**
 * Every day of the week visible at once (no scrolling): "Mon" over the date number. The selected day is
 * filled teal, today gets a teal outline.
 */
@Composable
internal fun DaySelector(days: List<DayPlan>, selectedDay: Int, today: Int?, onSelect: (Int) -> Unit, modifier: Modifier = Modifier) {
    val short = stringArrayResource(R.array.timetable_days_short)
    val long = stringArrayResource(R.array.timetable_days_long)
    Row(modifier.fillMaxWidth().selectableGroup(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        days.forEach { plan ->
            val selected = plan.day == selectedDay
            val isToday = plan.day == today
            Surface(
                shape = MaterialTheme.shapes.medium,
                color = if (selected) AppColors.Primary else AppColors.Surface,
                border = BorderStroke(if (isToday && !selected) 2.dp else 1.dp, if (isToday || selected) AppColors.Primary else AppColors.Border),
                modifier = Modifier
                    .weight(1f)
                    .selectable(selected = selected, role = Role.Tab, onClick = { onSelect(plan.day) })
                    .semantics { contentDescription = listOfNotNull(long.getOrNull(plan.day - 1), plan.date?.dayOfMonth?.toString()).joinToString(" ") },
            ) {
                Column(Modifier.padding(vertical = 6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        short.getOrElse(plan.day - 1) { plan.day.toString() },
                        style = MaterialTheme.typography.labelSmall,
                        color = if (selected) AppColors.OnPrimary else AppColors.TextSecondary,
                    )
                    plan.date?.let {
                        Text(
                            it.dayOfMonth.toString(),
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = when {
                                selected -> AppColors.OnPrimary
                                plan.holiday != null || !plan.isWorkingDay -> AppColors.TextSecondary
                                else -> AppColors.TextPrimary
                            },
                        )
                    }
                }
            }
        }
    }
}

package com.schoolapp.feature.timetable.substitutions

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.timetable.R

/** "Period 3 · 9:20 – 10:00 AM"; a slot the bell schedule doesn't know shows as "Slot N". */
@Composable
internal fun periodLabel(index: Int, number: Int?, timeRange: String?): String {
    val name = number?.let { stringResource(R.string.timetable_period, it) } ?: stringResource(R.string.timetable_subs_period_slot, index)
    return listOfNotNull(name, timeRange).joinToString(" · ")
}

/** One substitution: class, period, substitute and the teacher they replace, reason; remove for editors. */
@Composable
internal fun SubstitutionCard(item: SubstitutionItem, onRemove: (() -> Unit)?, modifier: Modifier = Modifier) {
    val classLabel = item.classLabel ?: stringResource(R.string.timetable_subs_unknown_class)
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f).semantics(mergeDescendants = true) {}, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(classLabel, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
                Text(
                    periodLabel(item.periodIndex, item.periodNumber, item.timeRange),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
                item.substitute?.let {
                    Text(stringResource(R.string.timetable_subs_substitute, it), style = MaterialTheme.typography.bodyLarge, color = AppColors.Primary)
                }
                Text(
                    item.originalTeacher?.let { stringResource(R.string.timetable_subs_original, it) }
                        ?: stringResource(R.string.timetable_subs_no_teacher),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
                item.reason?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary) }
            }
            onRemove?.let {
                IconButton(onClick = it) {
                    Icon(
                        Icons.Outlined.DeleteOutline,
                        contentDescription = stringResource(R.string.timetable_subs_remove_for, classLabel),
                        tint = AppColors.Error,
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 360)
@Composable
private fun SubstitutionCardPreview() = SchoolTheme {
    SubstitutionCard(
        SubstitutionItem("o1", "Class 5 · A", 3, 3, "9:20 – 10:00 AM", "Hina Shah", "Omar Ali", "Class teacher on leave"),
        onRemove = {},
    )
}

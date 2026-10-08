package com.schoolapp.feature.organisation.classes.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.feature.organisation.R

/** One class: totals, section chips with class teachers, subjects, timetable state per section and issues. */
@Composable
internal fun ClassOverviewCard(item: ClassOverview, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Header(item)
            Labelled(stringResource(R.string.org_class_sections_label)) {
                if (item.sections.isEmpty()) {
                    Text(stringResource(R.string.org_class_no_sections), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                } else {
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        item.sections.forEach { SectionChip(it) }
                    }
                }
            }
            if (item.subjectCount > 0) {
                val names = item.subjects.joinToString(", ") { it.name }
                val count = pluralStringResource(R.plurals.org_class_subjects, item.subjectCount, item.subjectCount)
                Labelled(stringResource(R.string.org_class_subjects_label)) {
                    Text(
                        text = if (names.isBlank()) count else "$count · $names",
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextPrimary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            timetableSummary(item)?.let { summary ->
                Labelled(stringResource(R.string.org_class_timetable_label)) {
                    Text(summary, style = MaterialTheme.typography.bodySmall, color = AppColors.TextPrimary)
                }
            }
            IssueChips(item)
        }
    }
}

@Composable
private fun Header(item: ClassOverview) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(item.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
        val students = pluralStringResource(R.plurals.org_section_students, item.studentCount, item.studentCount)
        val sections = pluralStringResource(R.plurals.org_class_section_count, item.sections.size, item.sections.size)
        Text("$students · $sections", style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
    }
}

@Composable
private fun Labelled(label: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
        content()
    }
}

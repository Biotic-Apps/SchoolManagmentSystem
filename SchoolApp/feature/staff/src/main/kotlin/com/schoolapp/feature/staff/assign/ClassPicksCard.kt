package com.schoolapp.feature.staff.assign

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.AllocationTeacher
import com.schoolapp.core.model.staff.ClassAllocation
import com.schoolapp.feature.staff.R

/** Class teacher sections of one class. A section already led by someone else shows who will be replaced. */
@Composable
internal fun ClassTeacherCard(
    allocation: ClassAllocation,
    staffId: String,
    picked: Set<String>,
    enabled: Boolean,
    onToggle: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.staff_assign_class_teacher), subtitle = stringResource(R.string.staff_assign_class_teacher_hint))
        PickChips(
            chips = allocation.sections.map { section ->
                PickChip(section.id, section.name, section.classTeacher, section.id in picked)
            },
            staffId = staffId,
            enabled = enabled,
            onToggle = onToggle,
        )
    }
}

/** Subject × section picks; a subject of a group only offers the sections of that group. */
@Composable
internal fun SubjectTeacherCard(
    allocation: ClassAllocation,
    staffId: String,
    picked: Set<SubjectPick>,
    enabled: Boolean,
    onToggle: (sectionId: String, subjectId: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.staff_assign_subjects), subtitle = stringResource(R.string.staff_assign_subjects_hint))
        if (allocation.subjects.isEmpty()) {
            Text(stringResource(R.string.staff_assign_no_subjects), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        allocation.subjects.forEach { subject ->
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(subject.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                PickChips(
                    chips = allocation.sections.filter { subject.appliesTo(it) }.map { section ->
                        val current = allocation.subjectTeachers[section.id to subject.id]
                        PickChip(section.id, section.name, current, SubjectPick(section.id, subject.id) in picked)
                    },
                    staffId = staffId,
                    enabled = enabled,
                    onToggle = { onToggle(it, subject.id) },
                )
            }
        }
    }
}

private data class PickChip(val id: String, val sectionName: String, val current: AllocationTeacher?, val selected: Boolean)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PickChips(chips: List<PickChip>, staffId: String, enabled: Boolean, onToggle: (String) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        chips.forEach { chip ->
            val mine = chip.current?.staffId == staffId
            val label = when {
                mine -> stringResource(R.string.staff_assign_chip_assigned, chip.sectionName)
                chip.current != null -> stringResource(R.string.staff_assign_chip_taken, chip.sectionName, chip.current.name)
                else -> stringResource(R.string.staff_assign_chip_section, chip.sectionName)
            }
            FilterChip(
                selected = chip.selected || mine,
                onClick = { onToggle(chip.id) },
                enabled = enabled && !mine,
                label = { Text(label) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = AppColors.Selected,
                    selectedLabelColor = AppColors.OnSelected,
                ),
            )
        }
    }
}

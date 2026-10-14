package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.AssistChip
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.OptionPickerField
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.model.ClassLevel
import com.schoolapp.feature.admin.schools.setup.model.ClassRow
import com.schoolapp.feature.admin.schools.setup.model.SectionRow
import com.schoolapp.feature.admin.schools.setup.model.SetupPresets

/** Section letter chips (at least one, up to 8) and, for Matric, the Science / Arts group of each. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun SectionsEditor(row: ClassRow, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    val chosen = row.sections.map { it.name }
    val letters = (SetupPresets.SECTION_LETTERS + chosen).distinct().sorted()
    fun setSections(names: List<String>) = edits.classRow(row.id) { current ->
        current.copy(sections = names.sorted().map { name -> current.sections.firstOrNull { it.name == name } ?: SectionRow(name) })
    }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(stringResource(R.string.setup_sections_of, row.name), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            letters.forEach { letter ->
                val selected = letter in chosen
                FilterChip(
                    selected = selected,
                    // At least one section stays selected.
                    onClick = { if (!selected) setSections(chosen + letter) else if (chosen.size > 1) setSections(chosen - letter) },
                    label = { Text(letter) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = AppColors.Selected, selectedLabelColor = AppColors.OnSelected),
                )
            }
            val next = SetupPresets.nextLetter(row.sections)
            if (next != null && row.sections.size < SetupPresets.MAX_SECTIONS && next !in letters) {
                AssistChip(
                    onClick = { setSections(chosen + next) },
                    label = { Text(stringResource(R.string.setup_add_section)) },
                    leadingIcon = { Icon(Icons.Outlined.Add, contentDescription = null) },
                )
            }
        }
        if (row.level == ClassLevel.MATRIC) {
            val groups = listOf(SwitcherOption(NO_GROUP, stringResource(R.string.setup_no_group))) +
                SetupPresets.MATRIC_GROUPS.map { SwitcherOption(it, it) }
            row.sections.forEach { section ->
                OptionPickerField(
                    label = stringResource(R.string.setup_group_of_section, section.name),
                    options = groups,
                    selectedId = section.group.ifBlank { NO_GROUP },
                    onSelect = { group ->
                        edits.classRow(row.id) { current ->
                            current.copy(
                                sections = current.sections.map {
                                    if (it.name == section.name) it.copy(group = group.takeIf { g -> g != NO_GROUP }.orEmpty()) else it
                                },
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

private const val NO_GROUP = "none"

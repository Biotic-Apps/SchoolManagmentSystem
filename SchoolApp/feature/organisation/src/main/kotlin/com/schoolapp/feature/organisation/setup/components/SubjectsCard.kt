package com.schoolapp.feature.organisation.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.CreatablePickerSheet
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.setup.ClassLevel
import com.schoolapp.feature.organisation.setup.ClassSetupUiState
import com.schoolapp.feature.organisation.setup.CurriculumController

/** The class's subjects with periods/week, optional, group, order; "Add subject…" and "Apply preset". */
@Composable
internal fun SubjectsCard(state: ClassSetupUiState, controller: CurriculumController, onDismissError: (String) -> Unit) {
    val edit = state.rights.editStructure
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.org_setup_subjects), subtitle = stringResource(R.string.org_setup_subjects_hint))
        if (state.subjects.isEmpty()) {
            Text(stringResource(R.string.org_setup_no_subjects), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        state.subjects.forEachIndexed { index, subject ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            SubjectRow(
                subject = subject,
                index = index,
                count = state.subjects.size,
                groups = state.groupOptions.takeIf { state.showGroups },
                edit = edit,
                error = state.subjectErrors[subject.subjectId],
                controller = controller,
                onDismissError = { onDismissError(subject.subjectId) },
            )
        }
        PlannedLine(state)
        if (edit) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AddSubjectButton(state, controller)
                PresetButton(state.applyingPreset, controller::applyPreset)
            }
        }
    }
}

@Composable
private fun PlannedLine(state: ClassSetupUiState) {
    val total = state.weeklyPeriods ?: return
    state.plannedByGroup.forEach { (group, planned) ->
        val text = if (group == null) {
            stringResource(R.string.org_periods_planned, planned, total)
        } else {
            stringResource(R.string.org_periods_planned_group, group, planned, total)
        }
        Text(text, style = MaterialTheme.typography.bodySmall, color = if (planned > total) AppColors.Warning else AppColors.TextSecondary)
    }
}

@Composable
private fun AddSubjectButton(state: ClassSetupUiState, controller: CurriculumController) {
    var open by rememberSaveable { mutableStateOf(false) }
    SecondaryButton(stringResource(R.string.org_add_subject_to_class), onClick = { open = true }, leadingIcon = Icons.Outlined.Add)
    if (open) {
        CreatablePickerSheet(
            title = stringResource(R.string.org_add_subject_to_class),
            options = state.addableSubjects.map { PickerOption(it.id, it.name, it.code) },
            selectedId = null,
            onDismiss = { open = false },
            onSelect = { id ->
                open = false
                state.addableSubjects.firstOrNull { it.id == id }?.let(controller::add)
            },
            onCreate = if (state.rights.createSubject) { name -> open = false; controller.createNew(name) } else null,
        )
    }
}

@Composable
private fun PresetButton(applying: Boolean, onApply: (ClassLevel) -> Unit) {
    var open by rememberSaveable { mutableStateOf(false) }
    Row {
        SecondaryButton(stringResource(R.string.org_apply_preset), onClick = { open = true }, loading = applying, leadingIcon = Icons.Outlined.AutoAwesome)
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            Text(
                stringResource(R.string.org_preset_hint),
                style = MaterialTheme.typography.labelMedium,
                color = AppColors.TextSecondary,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            )
            ClassLevel.entries.forEach { level ->
                DropdownMenuItem(
                    text = { Text(stringResource(levelLabel(level))) },
                    onClick = {
                        open = false
                        onApply(level)
                    },
                )
            }
        }
    }
}

private fun levelLabel(level: ClassLevel): Int = when (level) {
    ClassLevel.EARLY -> R.string.org_level_early
    ClassLevel.PRIMARY -> R.string.org_level_primary
    ClassLevel.MIDDLE -> R.string.org_level_middle
    ClassLevel.MATRIC -> R.string.org_level_matric
}

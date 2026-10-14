package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.OptionPickerField
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.model.ClassLevel
import com.schoolapp.feature.admin.schools.setup.model.ClassRow

/** One class: include tick, name, level, sections (with groups for Matric) and its subjects. */
@Composable
internal fun ClassCard(row: ClassRow, subjectNames: List<String>, error: String?, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    var editingSubjects by rememberSaveable { mutableStateOf(false) }
    AppCard(modifier.fillMaxWidth(), selected = row.include, contentPadding = 12.dp, verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
                checked = row.include,
                onCheckedChange = { checked -> edits.classRow(row.id) { it.copy(include = checked) } },
                colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary),
            )
            if (row.custom) {
                AppTextField(
                    value = row.name,
                    onValueChange = { v -> edits.classRow(row.id) { it.copy(name = v) } },
                    label = stringResource(R.string.setup_class_name),
                    kind = FieldKind.Title,
                    modifier = Modifier.weight(1f),
                )
                IconButton(onClick = { edits.removeClass(row.id) }) {
                    Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.setup_remove_class, row.name))
                }
            } else {
                Text(row.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            }
        }
        if (row.include) {
            OptionPickerField(
                label = stringResource(R.string.setup_level),
                options = ClassLevel.entries.map { SwitcherOption(it.name, levelLabel(it)) },
                selectedId = row.level.name,
                onSelect = { id -> edits.classRow(row.id) { it.copy(level = ClassLevel.valueOf(id)) } },
                modifier = Modifier.fillMaxWidth(),
            )
            SectionsEditor(row, edits)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(
                    pluralStringResource(R.plurals.setup_subject_count, row.subjects.size, row.subjects.size),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
                AppTextButton(stringResource(R.string.setup_edit_subjects), onClick = { editingSubjects = true })
            }
        }
        error?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
    }
    if (editingSubjects) {
        ClassSubjectsSheet(row, subjectNames, edits, onDismiss = { editingSubjects = false })
    }
}

@Composable
internal fun levelLabel(level: ClassLevel): String = stringResource(
    when (level) {
        ClassLevel.EARLY -> R.string.setup_level_early
        ClassLevel.PRIMARY -> R.string.setup_level_primary
        ClassLevel.MIDDLE -> R.string.setup_level_middle
        ClassLevel.MATRIC -> R.string.setup_level_matric
        ClassLevel.CUSTOM -> R.string.setup_level_other
    },
)

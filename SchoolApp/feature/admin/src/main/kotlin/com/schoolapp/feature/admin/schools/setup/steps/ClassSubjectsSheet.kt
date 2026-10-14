package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.model.ClassRow
import com.schoolapp.feature.admin.schools.setup.model.SetupPresets

/** What one class studies: tick subjects and set periods per week (one row of the web's subject matrix). */
@Composable
internal fun ClassSubjectsSheet(row: ClassRow, subjectNames: List<String>, edits: SetupFormEdits, onDismiss: () -> Unit) {
    // Subjects of the class that are not matrix columns (none normally) still show.
    val columns = (subjectNames + row.subjects.map { it.name }).distinct()
    AppBottomSheet(title = stringResource(R.string.setup_subjects_of, row.name), onDismiss = onDismiss) {
        Text(stringResource(R.string.setup_periods_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        if (SetupPresets.presetFor(row.level) != null) {
            AppTextButton(
                stringResource(R.string.setup_use_preset, levelLabel(row.level)),
                onClick = { edits.classRow(row.id) { it.copy(subjects = SetupPresets.presetSubjects(it.level)) } },
            )
        }
        Column(Modifier.verticalScroll(rememberScrollState()).padding(bottom = 16.dp)) {
            columns.forEach { name ->
                val cell = row.subjects.firstOrNull { it.name == name }
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = cell != null,
                        onCheckedChange = { checked ->
                            edits.classRow(row.id) { current ->
                                val subjects = if (checked) {
                                    current.subjects + SetupPresets.cellFor(current.level, name)
                                } else {
                                    current.subjects.filterNot { it.name == name }
                                }
                                current.copy(subjects = subjects)
                            }
                        },
                        colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary),
                    )
                    Column(Modifier.weight(1f)) {
                        Text(name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                        cell?.group?.takeIf { it.isNotBlank() }?.let {
                            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                        }
                    }
                    if (cell != null) {
                        NumberStepper(
                            value = cell.periodsPerWeek,
                            onValueChange = { periods ->
                                edits.classRow(row.id) { current ->
                                    current.copy(subjects = current.subjects.map { if (it.name == name) it.copy(periodsPerWeek = periods) else it })
                                }
                            },
                            label = stringResource(R.string.setup_periods_of, name),
                            min = 0,
                            max = SetupPresets.MAX_PERIODS_PER_WEEK,
                        )
                    }
                }
            }
        }
    }
}

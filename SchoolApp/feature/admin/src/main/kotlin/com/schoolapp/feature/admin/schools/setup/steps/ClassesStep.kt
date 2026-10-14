package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.SetupUiState
import com.schoolapp.feature.admin.schools.setup.components.SetupPanel
import com.schoolapp.feature.admin.schools.setup.components.setupErrorText
import com.schoolapp.feature.admin.schools.setup.model.SetupKeys
import com.schoolapp.feature.admin.schools.setup.model.SetupPresets

/** Classes with their own sections and subjects (web ClassesStep + SubjectMatrix, one class at a time on mobile). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ClassesStep(state: SetupUiState, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    val academics = state.form.academics
    if (!academics.createSession) {
        InlineMessage(stringResource(R.string.setup_classes_need_session), StatusTone.Info, modifier)
        return
    }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        setupErrorText(state.error(SetupKeys.CLASSES))?.let { InlineMessage(it, StatusTone.Error) }
        val levels = SetupPresets.LEVELS.filter { preset -> state.form.includedClasses.any { it.level == preset.level } }
        if (levels.isNotEmpty()) {
            Text(stringResource(R.string.setup_presets_title), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                levels.forEach { preset ->
                    AppTextButton(stringResource(R.string.setup_use_preset, levelLabel(preset.level)), onClick = { edits.applyPreset(preset.level) })
                }
            }
        }
        academics.classes.forEachIndexed { index, row ->
            ClassCard(
                row = row,
                subjectNames = academics.subjectNames,
                error = setupErrorText(state.error(SetupKeys.classRow(index))),
                edits = edits,
            )
        }
        AddNamedRow(
            label = stringResource(R.string.setup_add_class_label),
            button = stringResource(R.string.setup_add_class),
            onAdd = edits::addClass,
        )
        SetupPanel(stringResource(R.string.setup_subjects_title), description = stringResource(R.string.setup_subjects_desc)) {
            Text(academics.subjectNames.joinToString(", "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            AddNamedRow(
                label = stringResource(R.string.setup_add_subject_label),
                button = stringResource(R.string.setup_add_subject),
                onAdd = edits::addSubject,
            )
        }
    }
}

/** Text field + "Add" button that clears after adding. */
@Composable
private fun AddNamedRow(label: String, button: String, onAdd: (String) -> Unit) {
    var text by rememberSaveable { mutableStateOf("") }
    val add = {
        if (text.isNotBlank()) {
            onAdd(text)
            text = ""
        }
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        AppTextField(
            value = text,
            onValueChange = { text = it },
            label = label,
            kind = FieldKind.Title,
            onImeAction = add,
            modifier = Modifier.weight(1f),
        )
        SecondaryButton(text = button, onClick = add, enabled = text.isNotBlank(), leadingIcon = Icons.Outlined.Add)
    }
}

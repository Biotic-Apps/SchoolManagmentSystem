package com.schoolapp.feature.progress.notes

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.components.WrapChoiceChips
import com.schoolapp.feature.progress.components.categoryLabel

@Composable
internal fun AddNoteSheet(
    form: NoteForm,
    studentLabel: String,
    onCategoryChange: (ProgressCategory) -> Unit,
    onNoteChange: (String) -> Unit,
    onVisibleChange: (Boolean) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.progress_add_note), onDismiss = onDismiss) {
        Text(studentLabel, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SectionHeader(title = stringResource(R.string.progress_category))
        WrapChoiceChips(
            options = ProgressCategory.entries.map { SwitcherOption(it.name, categoryLabel(it)) },
            selectedId = form.category?.name,
            onSelect = { onCategoryChange(ProgressCategory.valueOf(it)) },
            enabled = !form.isSaving,
        )
        if (form.categoryMissing) {
            Text(stringResource(R.string.progress_category_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        AppTextArea(
            value = form.note,
            onValueChange = onNoteChange,
            label = stringResource(R.string.progress_note),
            enabled = !form.isSaving,
            errorText = when (form.noteError) {
                NoteError.REQUIRED -> stringResource(R.string.progress_note_required)
                NoteError.TOO_LONG -> stringResource(R.string.progress_note_too_long)
                null -> null
            },
            supportingText = stringResource(R.string.progress_note_count, form.note.trim().length),
        )
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.progress_visible_to_parent), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                Text(
                    stringResource(R.string.progress_visible_to_parent_help),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
            Switch(
                checked = form.visibleToParent,
                onCheckedChange = onVisibleChange,
                enabled = !form.isSaving,
                colors = SwitchDefaults.colors(checkedTrackColor = AppColors.Primary, checkedThumbColor = AppColors.OnPrimary),
            )
        }
        PrimaryButton(stringResource(R.string.progress_save_note), onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}

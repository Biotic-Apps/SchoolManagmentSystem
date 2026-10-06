package com.schoolapp.feature.syllabus.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.syllabus.TopicStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.syllabus.R
import com.schoolapp.feature.syllabus.components.topicStatusLabel

@Composable
internal fun TopicProgressSheet(
    editor: TopicEditor,
    today: String,
    onStatusChange: (TopicStatus) -> Unit,
    onCompletedOnChange: (String) -> Unit,
    onNoteChange: (String) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    AppBottomSheet(title = stringResource(R.string.syllabus_update_title), onDismiss = onDismiss) {
        SectionHeader(title = editor.topicTitle)
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SectionHeader(title = stringResource(R.string.syllabus_status))
        FilterChipRow(
            options = TopicStatus.entries.map { SwitcherOption(it.name, topicStatusLabel(it)) },
            selectedId = editor.status.name,
            onSelect = { onStatusChange(TopicStatus.valueOf(it)) },
        )
        if (editor.status == TopicStatus.COMPLETED) {
            PickerField(
                value = formatDate(editor.completedOn).orEmpty(),
                label = stringResource(R.string.syllabus_completed_on),
                onClick = { pickDate = true },
                enabled = !editor.isSaving,
                errorText = if (editor.dateMissing) stringResource(R.string.syllabus_completed_on_required) else null,
            )
        }
        AppTextArea(
            value = editor.note,
            onValueChange = onNoteChange,
            label = stringResource(R.string.syllabus_note),
            enabled = !editor.isSaving,
        )
        PrimaryButton(stringResource(R.string.syllabus_save), onSave, loading = editor.isSaving)
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = editor.completedOn,
            maxDate = today,
            onConfirm = {
                pickDate = false
                onCompletedOnChange(it)
            },
            onDismiss = { pickDate = false },
        )
    }
}

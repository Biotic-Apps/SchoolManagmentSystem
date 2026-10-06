package com.schoolapp.feature.diary.editor

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material3.LinearProgressIndicator
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
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.components.EntryStatusBanner

internal class DiaryEditorActions(
    val onSubjectSelected: (String) -> Unit,
    val onTopicsChange: (String) -> Unit,
    val onHomeworkChange: (String) -> Unit,
    val onDueDateChange: (String?) -> Unit,
    val onAddFile: () -> Unit,
    val onOpenFile: (String) -> Unit,
    val onRemoveFile: (String) -> Unit,
    val onSaveDraft: () -> Unit,
    val onPublish: () -> Unit,
)

@Composable
internal fun DiaryEditorContent(
    state: DiaryEditorUiState,
    actions: DiaryEditorActions,
    modifier: Modifier = Modifier,
) {
    var pickDueDate by rememberSaveable { mutableStateOf(false) }
    val editable = !state.isReadOnly && state.busyAction == null
    ScreenColumn(modifier) {
        state.entry?.let { entry -> item(key = "status") { EntryStatusBanner(entry) } }
        if (state.locked) item(key = "locked") { InlineMessage(stringResource(R.string.diary_locked), StatusTone.Warning) }
        if (!state.canEdit) item(key = "no_edit") { InlineMessage(stringResource(R.string.diary_no_edit_permission), StatusTone.Info) }
        state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "subject") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(title = stringResource(R.string.diary_subject))
                FilterChipRow(
                    options = state.subjects.map { SwitcherOption(it.id, it.name) },
                    selectedId = state.subjectId,
                    onSelect = { if (editable) actions.onSubjectSelected(it) },
                )
                if (state.subjectMissing) {
                    Text(stringResource(R.string.diary_subject_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
                }
            }
        }
        item(key = "topics") {
            AppTextArea(
                value = state.topics,
                onValueChange = actions.onTopicsChange,
                label = stringResource(R.string.diary_topics_label),
                enabled = editable,
                errorText = if (state.topicsMissing) stringResource(R.string.diary_topics_required) else null,
            )
        }
        item(key = "homework") {
            AppTextArea(
                value = state.homework,
                onValueChange = actions.onHomeworkChange,
                label = stringResource(R.string.diary_homework_label),
                enabled = editable,
            )
        }
        if (state.homework.isNotBlank()) {
            item(key = "due") {
                DueDateField(
                    dueDate = state.dueDate,
                    invalid = state.dueDateInvalid,
                    enabled = editable,
                    onPick = { pickDueDate = true },
                    onClear = { actions.onDueDateChange(null) },
                )
            }
        }
        item(key = "files") { AttachmentsField(state, editable, actions) }
        item(key = "actions") { EditorButtons(state, actions) }
    }
    if (pickDueDate) {
        AppDatePickerDialog(
            initialDate = state.dueDate ?: state.date,
            onConfirm = {
                pickDueDate = false
                actions.onDueDateChange(it)
            },
            onDismiss = { pickDueDate = false },
        )
    }
}

@Composable
private fun DueDateField(dueDate: String?, invalid: Boolean, enabled: Boolean, onPick: () -> Unit, onClear: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        PickerField(
            value = formatDate(dueDate).orEmpty(),
            label = stringResource(R.string.diary_due_date),
            onClick = onPick,
            enabled = enabled,
            errorText = if (invalid) stringResource(R.string.diary_due_date_invalid) else null,
        )
        if (dueDate != null && enabled) AppTextButton(stringResource(R.string.diary_clear_due_date), onClear)
    }
}

@Composable
private fun AttachmentsField(state: DiaryEditorUiState, editable: Boolean, actions: DiaryEditorActions) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(title = stringResource(R.string.diary_attachments))
        AttachmentChips(
            items = state.attachments.map { AttachmentChipItem(it.id, it.name, it.isImage) },
            onOpen = { actions.onOpenFile(it.id) },
            onRemove = if (editable) ({ actions.onRemoveFile(it.id) }) else null,
        )
        if (state.isUploading) {
            Text(stringResource(R.string.diary_uploading), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            LinearProgressIndicator(Modifier.fillMaxWidth(), color = AppColors.Primary, trackColor = AppColors.Border)
        }
        state.uploadError?.let { error ->
            val text = if (error is AppError.Network) stringResource(R.string.diary_upload_offline) else appErrorMessage(error)
            InlineMessage(text, StatusTone.Error)
        }
        if (editable) {
            SecondaryButton(
                text = stringResource(R.string.diary_add_file),
                onClick = actions.onAddFile,
                enabled = !state.isUploading,
                leadingIcon = Icons.Outlined.AttachFile,
            )
        }
    }
}

@Composable
private fun EditorButtons(state: DiaryEditorUiState, actions: DiaryEditorActions) {
    if (state.isReadOnly) return
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.isHelper) {
            InlineMessage(stringResource(R.string.diary_helper_note), StatusTone.Info)
        }
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            SecondaryButton(
                text = stringResource(R.string.diary_save_draft),
                onClick = actions.onSaveDraft,
                loading = state.busyAction == EditorAction.SAVE_DRAFT,
                enabled = !state.isBusy,
                modifier = Modifier.weight(1f),
            )
            if (state.canPublish) {
                PrimaryButton(
                    text = stringResource(R.string.diary_publish),
                    onClick = actions.onPublish,
                    loading = state.busyAction == EditorAction.PUBLISH,
                    enabled = !state.isBusy,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

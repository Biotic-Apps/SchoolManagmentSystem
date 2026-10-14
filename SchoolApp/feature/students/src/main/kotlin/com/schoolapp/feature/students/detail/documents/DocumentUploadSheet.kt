package com.schoolapp.feature.students.detail.documents

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.CloudUpload
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.documents.DocumentTypes
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R

internal data class UploadSheetActions(
    val onTypeChange: (String) -> Unit,
    val onPickFile: () -> Unit,
    val onNoteChange: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

@Composable
internal fun DocumentUploadSheet(form: DocumentUploadForm, actions: UploadSheetActions) {
    val issues = if (form.showErrors) form.issues else emptySet()
    val enabled = !form.isSaving
    AppBottomSheet(title = stringResource(R.string.sd_docs_upload_title), onDismiss = actions.onDismiss) {
        CreatablePickerField(
            label = stringResource(R.string.sd_docs_type),
            options = DocumentTypes.all.map { PickerOption(it, docTypeLabel(it)) },
            selectedId = form.docType,
            onSelect = { it?.let(actions.onTypeChange) },
            errorText = if (UploadIssue.TYPE_REQUIRED in issues) stringResource(R.string.sd_docs_type_required) else null,
            enabled = enabled,
        )
        FileSection(form, issues, enabled, actions.onPickFile)
        AppTextArea(
            value = form.note,
            onValueChange = actions.onNoteChange,
            label = stringResource(R.string.sd_docs_note),
            modifier = Modifier.fillMaxWidth(),
            errorText = if (UploadIssue.NOTE_TOO_LONG in issues) stringResource(R.string.sd_docs_note_too_long) else null,
            supportingText = "${form.note.trim().length} / ${DocumentUploadForm.NOTE_MAX}",
            enabled = enabled,
            minLines = 2,
        )
        form.saveError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.sd_docs_upload),
            onClick = actions.onSubmit,
            modifier = Modifier.fillMaxWidth(),
            enabled = !form.isUploadingFile,
            loading = form.isSaving,
            leadingIcon = Icons.Outlined.CloudUpload,
        )
    }
}

@Composable
private fun FileSection(form: DocumentUploadForm, issues: Set<UploadIssue>, enabled: Boolean, onPickFile: () -> Unit) {
    Text(stringResource(R.string.sd_docs_file), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
    when {
        form.isUploadingFile -> {
            Text(stringResource(R.string.sd_docs_uploading_file), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            LinearProgressIndicator(Modifier.fillMaxWidth(), color = AppColors.Primary, trackColor = AppColors.Accent)
        }
        form.fileId != null -> InlineMessage(stringResource(R.string.sd_docs_file_ready, form.fileName.orEmpty()), StatusTone.Success)
    }
    form.fileError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
    SecondaryButton(
        text = stringResource(if (form.fileUri == null) R.string.sd_docs_pick_file else R.string.sd_docs_replace_file),
        onClick = onPickFile,
        modifier = Modifier.fillMaxWidth(),
        enabled = enabled && !form.isUploadingFile,
        leadingIcon = Icons.Outlined.AttachFile,
    )
    val issue = when {
        UploadIssue.FILE_TYPE in issues -> R.string.sd_docs_file_type
        UploadIssue.FILE_UPLOADING in issues -> R.string.sd_docs_file_wait
        UploadIssue.FILE_REQUIRED in issues -> R.string.sd_docs_file_required
        else -> null
    }
    issue?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
}

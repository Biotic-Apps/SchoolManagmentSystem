package com.schoolapp.feature.homework.assign

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
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
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.assign.AssignHomeworkViewModel.Companion.DESCRIPTION_MAX
import com.schoolapp.feature.homework.assign.AssignHomeworkViewModel.Companion.TITLE_MAX
import com.schoolapp.feature.homework.components.UploadErrorMessage
import java.time.LocalDate

internal class AssignHomeworkActions(
    val onSubject: (String) -> Unit,
    val onTitle: (String) -> Unit,
    val onDescription: (String) -> Unit,
    val onDueDate: (String) -> Unit,
    val onMaxMarks: (String) -> Unit,
    val onAttach: (String) -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun AssignHomeworkForm(state: AssignHomeworkUiState, actions: AssignHomeworkActions, modifier: Modifier = Modifier) {
    var pickDue by rememberSaveable { mutableStateOf(false) }
    val errors = state.errors
    val enabled = !state.isSaving
    ScreenColumn(modifier) {
        item(key = "intro") {
            Text(
                stringResource(R.string.homework_assign_subtitle, state.sectionLabel),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        item(key = "subject") { SubjectField(state, enabled, actions.onSubject) }
        item(key = "title") {
            AppTextField(
                value = state.title,
                onValueChange = actions.onTitle,
                label = stringResource(R.string.homework_field_title),
                enabled = enabled,
                errorText = when {
                    AssignField.TITLE in errors -> stringResource(R.string.homework_error_title)
                    AssignField.TITLE_LENGTH in errors -> stringResource(R.string.homework_error_too_long, TITLE_MAX)
                    else -> null
                },
            )
        }
        item(key = "description") {
            AppTextArea(
                value = state.description,
                onValueChange = actions.onDescription,
                label = stringResource(R.string.homework_field_description),
                enabled = enabled,
                minLines = 4,
                maxLines = 10,
                errorText = when {
                    AssignField.DESCRIPTION in errors -> stringResource(R.string.homework_error_description)
                    AssignField.DESCRIPTION_LENGTH in errors -> stringResource(R.string.homework_error_too_long, DESCRIPTION_MAX)
                    else -> null
                },
            )
        }
        item(key = "due") {
            PickerField(
                value = formatDate(state.dueDate).orEmpty(),
                label = stringResource(R.string.homework_field_due),
                onClick = { pickDue = true },
                enabled = enabled,
                errorText = if (AssignField.DUE_DATE in errors) stringResource(R.string.homework_error_due) else null,
            )
        }
        item(key = "marks") {
            AppTextField(
                value = state.maxMarks,
                onValueChange = actions.onMaxMarks,
                label = stringResource(R.string.homework_field_max_marks),
                enabled = enabled,
                kind = FieldKind.Number,
                errorText = if (AssignField.MAX_MARKS in errors) stringResource(R.string.homework_error_marks) else null,
            )
        }
        item(key = "files") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AttachmentsField(state.attachments, onPicked = actions.onAttach, onRemove = actions.onRemoveAttachment, enabled = enabled)
                state.uploadError?.let { UploadErrorMessage(it) }
            }
        }
        state.error?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
        item(key = "submit") {
            PrimaryButton(
                text = stringResource(R.string.homework_assign_button),
                onClick = actions.onSubmit,
                loading = state.isSaving,
                enabled = !state.attachments.isUploading,
                leadingIcon = Icons.AutoMirrored.Outlined.Send,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
    if (pickDue) {
        AppDatePickerDialog(
            initialDate = state.dueDate ?: LocalDate.now().plusDays(1).toString(),
            minDate = LocalDate.now().toString(),
            onConfirm = {
                pickDue = false
                actions.onDueDate(it)
            },
            onDismiss = { pickDue = false },
        )
    }
}

@Composable
private fun SubjectField(state: AssignHomeworkUiState, enabled: Boolean, onSubject: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(title = stringResource(R.string.homework_subject))
        if (state.subjects.isEmpty()) {
            InlineMessage(stringResource(R.string.homework_no_subjects), StatusTone.Warning)
        } else {
            FilterChipRow(
                options = state.subjects.map { SwitcherOption(it.id, it.name) },
                selectedId = state.subjectId,
                onSelect = { if (enabled) onSubject(it) },
            )
        }
        if (AssignField.SUBJECT in state.errors) {
            Text(stringResource(R.string.homework_error_subject), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
    }
}

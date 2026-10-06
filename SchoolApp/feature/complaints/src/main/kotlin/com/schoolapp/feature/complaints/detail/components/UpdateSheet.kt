package com.schoolapp.feature.complaints.detail.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.statusLabel
import com.schoolapp.feature.complaints.detail.UpdateEditor

private val UpdateStatuses = listOf(ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED)
private const val NO_CHANGE = "none"

/** Assignee "Add update" (message + optional status) or complainant "Add comment". */
@Composable
internal fun UpdateSheet(
    editor: UpdateEditor,
    onMessageChange: (String) -> Unit,
    onStatusChange: (ComplaintStatus?) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    val title = stringResource(if (editor.allowStatus) R.string.complaints_add_update else R.string.complaints_add_comment)
    AppBottomSheet(title = title, onDismiss = onDismiss) {
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(
            value = editor.message,
            onValueChange = onMessageChange,
            label = stringResource(R.string.complaints_message),
            errorText = if (editor.messageMissing) stringResource(R.string.complaints_required) else null,
            enabled = !editor.isSaving,
        )
        if (editor.allowStatus) {
            SectionHeader(stringResource(R.string.complaints_new_status))
            FilterChipRow(
                options = listOf(SwitcherOption(NO_CHANGE, stringResource(R.string.complaints_no_status_change))) +
                    UpdateStatuses.map { SwitcherOption(it.name, statusLabel(it)) },
                selectedId = editor.status?.name ?: NO_CHANGE,
                onSelect = { id -> onStatusChange(UpdateStatuses.firstOrNull { it.name == id }) },
            )
        }
        PrimaryButton(stringResource(R.string.complaints_save), onSave, loading = editor.isSaving)
    }
}

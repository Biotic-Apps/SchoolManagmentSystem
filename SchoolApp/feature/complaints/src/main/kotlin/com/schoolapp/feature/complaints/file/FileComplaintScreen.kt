package com.schoolapp.feature.complaints.file

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.imePadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.feature.complaints.components.WrappingChoiceChips
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.categoryLabel
import com.schoolapp.feature.complaints.file.components.AnonymousSwitch

internal class FileComplaintActions(
    val onCategorySelected: (ComplaintCategory) -> Unit,
    val onChildSelected: (String?) -> Unit,
    val onSubjectChange: (String) -> Unit,
    val onDescriptionChange: (String) -> Unit,
    val onAnonymousChange: (Boolean) -> Unit,
    val onAttach: () -> Unit,
    val onOpenAttachment: (Attachment) -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun FileComplaintScreen(state: FileComplaintUiState, actions: FileComplaintActions, modifier: Modifier = Modifier) {
    val enabled = !state.isSubmitting
    ScreenColumn(modifier.imePadding()) {
        item(key = "category") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(stringResource(R.string.complaints_category))
                WrappingChoiceChips(
                    options = ComplaintCategory.entries.map { SwitcherOption(it.name, categoryLabel(it)) },
                    selectedId = state.category?.name,
                    onSelect = { actions.onCategorySelected(ComplaintCategory.valueOf(it)) },
                )
                if (state.categoryMissing) InlineMessage(stringResource(R.string.complaints_pick_category), StatusTone.Error)
            }
        }
        if (state.isParent && state.children.isNotEmpty()) {
            item(key = "child") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SectionHeader(stringResource(R.string.complaints_child))
                    WrappingChoiceChips(
                        options = state.children.map { SwitcherOption(it.id, it.fullName) } +
                            SwitcherOption(NO_CHILD, stringResource(R.string.complaints_no_child)),
                        selectedId = state.childId ?: NO_CHILD,
                        onSelect = { actions.onChildSelected(it.takeIf { id -> id != NO_CHILD }) },
                    )
                }
            }
        }
        item(key = "subject") {
            AppTextField(
                value = state.subject,
                onValueChange = actions.onSubjectChange,
                label = stringResource(R.string.complaints_subject),
                errorText = if (state.subjectMissing) stringResource(R.string.complaints_required) else null,
                enabled = enabled,
            )
        }
        item(key = "description") {
            AppTextArea(
                value = state.description,
                onValueChange = actions.onDescriptionChange,
                label = stringResource(R.string.complaints_description),
                errorText = if (state.descriptionMissing) stringResource(R.string.complaints_required) else null,
                enabled = enabled,
            )
        }
        item(key = "anonymous") { AnonymousSwitch(state.anonymous, actions.onAnonymousChange, enabled = enabled) }
        item(key = "attachments") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(
                    title = stringResource(R.string.complaints_attachments),
                    action = { AppTextButton(stringResource(R.string.complaints_attach), actions.onAttach, leadingIcon = Icons.Outlined.AttachFile, enabled = enabled) },
                )
                if (state.uploadingCount > 0) {
                    Text(stringResource(R.string.complaints_uploading), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                AttachmentChips(
                    items = state.attachments.map { AttachmentChipItem(it.id, it.name.orEmpty(), it.isImage) },
                    onOpen = { item -> state.attachments.firstOrNull { it.id == item.id }?.let(actions.onOpenAttachment) },
                    onRemove = { actions.onRemoveAttachment(it.id) },
                )
            }
        }
        state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "submit") {
            PrimaryButton(
                text = stringResource(R.string.complaints_submit),
                onClick = actions.onSubmit,
                loading = state.isSubmitting,
                enabled = state.uploadingCount == 0,
            )
        }
    }
}

private const val NO_CHILD = "none"

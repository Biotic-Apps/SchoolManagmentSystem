package com.schoolapp.feature.notices.compose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.notice.NoticeAudience
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.SwitchRow

internal class NoticeComposeActions(
    val onTitleChange: (String) -> Unit,
    val onBodyChange: (String) -> Unit,
    val onAudienceChange: ((NoticeAudience) -> NoticeAudience) -> Unit,
    val onRetryOptions: () -> Unit,
    val onAttach: (String) -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onExpiresOnChange: (String?) -> Unit,
    val onPinnedChange: (Boolean) -> Unit,
    val onSaveDraft: () -> Unit,
    val onPublish: () -> Unit,
)

@Composable
internal fun NoticeComposeForm(state: NoticeComposeUiState, actions: NoticeComposeActions, modifier: Modifier = Modifier) {
    var pickExpiry by rememberSaveable { mutableStateOf(false) }
    val enabled = !state.isSaving
    ScreenColumn(modifier) {
        state.error?.let { error ->
            item(key = "error") {
                val text = if (state.publishFailedAfterSave) stringResource(R.string.notices_publish_failed_saved) else appErrorMessage(error)
                InlineMessage(text, StatusTone.Error)
            }
        }
        item(key = "title") {
            AppTextField(
                value = state.title,
                onValueChange = actions.onTitleChange,
                label = stringResource(R.string.notices_field_title),
                enabled = enabled,
                errorText = if (state.titleMissing) stringResource(R.string.notices_title_required) else null,
            )
        }
        item(key = "body") {
            AppTextArea(
                value = state.body,
                onValueChange = actions.onBodyChange,
                label = stringResource(R.string.notices_field_body),
                enabled = enabled,
                errorText = if (state.bodyMissing) stringResource(R.string.notices_body_required) else null,
            )
        }
        item(key = "audience") { AudiencePicker(state, enabled, actions.onAudienceChange, actions.onRetryOptions) }
        item(key = "attachments") {
            AttachmentsField(
                draft = state.attachments,
                onPicked = actions.onAttach,
                onRemove = actions.onRemoveAttachment,
                max = MAX_ATTACHMENTS,
                enabled = enabled,
            )
        }
        item(key = "expiry") {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                PickerField(
                    value = formatDate(state.expiresOn) ?: stringResource(R.string.notices_no_expiry),
                    label = stringResource(R.string.notices_expires_on_optional),
                    onClick = { pickExpiry = true },
                    enabled = enabled,
                    errorText = if (state.expiryInvalid) stringResource(R.string.notices_expiry_invalid) else null,
                )
                if (state.expiresOn != null && enabled) {
                    AppTextButton(stringResource(R.string.notices_clear_expiry), onClick = { actions.onExpiresOnChange(null) })
                }
            }
        }
        item(key = "pinned") {
            SwitchRow(
                title = stringResource(R.string.notices_pin),
                supporting = stringResource(R.string.notices_pin_supporting),
                checked = state.pinned,
                onCheckedChange = actions.onPinnedChange,
                enabled = enabled,
            )
        }
        item(key = "buttons") {
            val busy = state.attachments.isUploading
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PrimaryButton(
                    stringResource(R.string.notices_publish),
                    actions.onPublish,
                    Modifier.fillMaxWidth(),
                    enabled = enabled && !busy,
                    loading = state.saving == ComposeAction.PUBLISH,
                )
                SecondaryButton(
                    stringResource(R.string.notices_save_draft),
                    actions.onSaveDraft,
                    Modifier.fillMaxWidth(),
                    enabled = enabled && !busy,
                    loading = state.saving == ComposeAction.DRAFT,
                )
            }
        }
    }
    if (pickExpiry) {
        AppDatePickerDialog(
            initialDate = state.expiresOn ?: state.today,
            onConfirm = {
                pickExpiry = false
                actions.onExpiresOnChange(it)
            },
            onDismiss = { pickExpiry = false },
        )
    }
}

private const val MAX_ATTACHMENTS = 10

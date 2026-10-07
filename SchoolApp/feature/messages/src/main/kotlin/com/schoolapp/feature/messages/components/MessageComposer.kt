package com.schoolapp.feature.messages.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.messages.R

/** Bottom bar: pending attachments, then attach / text / send. */
@Composable
internal fun MessageComposer(
    draft: String,
    attachments: List<Attachment>,
    uploading: Boolean,
    attachError: AppError?,
    canSend: Boolean,
    onDraftChange: (String) -> Unit,
    onAttach: () -> Unit,
    onRemoveAttachment: (String) -> Unit,
    onSend: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth().background(AppColors.Surface)) {
        HorizontalDivider(color = AppColors.Border)
        Column(Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            attachError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error, Modifier.padding(horizontal = 8.dp)) }
            if (uploading) {
                Text(
                    text = stringResource(R.string.messages_uploading),
                    style = MaterialTheme.typography.labelMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.padding(horizontal = 8.dp),
                )
            }
            AttachmentChips(
                items = attachments.map { AttachmentChipItem(it.id, it.name.orEmpty(), it.isImage) },
                onRemove = { onRemoveAttachment(it.id) },
                modifier = Modifier.padding(horizontal = 8.dp),
            )
            Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(onClick = onAttach) {
                    Icon(Icons.Outlined.AttachFile, contentDescription = stringResource(R.string.messages_attach), tint = AppColors.TextSecondary)
                }
                OutlinedTextField(
                    value = draft,
                    onValueChange = onDraftChange,
                    modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                    placeholder = { Text(stringResource(R.string.messages_composer_hint)) },
                    maxLines = 5,
                    shape = RoundedCornerShape(12.dp),
                    keyboardOptions = FieldKind.Sentence.keyboardOptions(ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = { if (canSend) onSend() }),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = AppColors.Surface,
                        unfocusedContainerColor = AppColors.Surface,
                        focusedBorderColor = AppColors.Primary,
                        unfocusedBorderColor = AppColors.Border,
                        cursorColor = AppColors.Primary,
                        focusedPlaceholderColor = AppColors.TextSecondary,
                        unfocusedPlaceholderColor = AppColors.TextSecondary,
                    ),
                )
                IconButton(onClick = onSend, enabled = canSend) {
                    Icon(
                        Icons.AutoMirrored.Outlined.Send,
                        contentDescription = stringResource(R.string.messages_send),
                        tint = if (canSend) AppColors.Primary else AppColors.Border,
                    )
                }
            }
        }
    }
}

package com.schoolapp.core.ui.attachments

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.ui.R

/**
 * Form attachments: header with "Attach file" (system picker), upload progress and removable chips.
 * Only hands the picked content Uri to [onPicked]; reading and uploading happen in the ViewModel off the main thread.
 */
@Composable
fun AttachmentsField(
    draft: AttachmentDraft,
    onPicked: (String) -> Unit,
    onRemove: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String = stringResource(R.string.ui_attachments),
    max: Int = AttachmentDraft.DEFAULT_MAX,
    enabled: Boolean = true,
) {
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { onPicked(it.toString()) }
    }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(
            title = label,
            subtitle = stringResource(R.string.ui_attachments_limit, max),
            action = {
                AppTextButton(
                    text = stringResource(R.string.ui_attach),
                    onClick = { picker.launch(ANY_FILE) },
                    leadingIcon = Icons.Outlined.AttachFile,
                    enabled = enabled && draft.canAdd(max),
                )
            },
        )
        if (draft.isUploading) {
            Text(stringResource(R.string.ui_uploading), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        AttachmentLinks(attachments = draft.items, onRemove = if (enabled) onRemove else null)
    }
}

private const val ANY_FILE = "*/*"

package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

@Immutable
data class AttachmentChipItem(val id: String, val name: String, val isImage: Boolean)

/** Wrapping row of file chips; tap opens, the optional close icon removes (while composing). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AttachmentChips(
    items: List<AttachmentChipItem>,
    modifier: Modifier = Modifier,
    onOpen: ((AttachmentChipItem) -> Unit)? = null,
    onRemove: ((AttachmentChipItem) -> Unit)? = null,
) {
    if (items.isEmpty()) return
    FlowRow(modifier = modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        items.forEach { item ->
            val label = item.name.ifBlank { stringResource(R.string.ds_attachment) }
            AssistChip(
                onClick = { onOpen?.invoke(item) },
                label = { Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.widthIn(max = 180.dp)) },
                leadingIcon = {
                    Icon(
                        if (item.isImage) Icons.Outlined.Image else Icons.Outlined.Description,
                        contentDescription = null,
                        tint = AppColors.Primary,
                        modifier = Modifier.size(18.dp),
                    )
                },
                trailingIcon = onRemove?.let { remove ->
                    {
                        IconButton(onClick = { remove(item) }, modifier = Modifier.size(24.dp)) {
                            Icon(
                                Icons.Outlined.Close,
                                contentDescription = stringResource(R.string.ds_remove_attachment, label),
                                modifier = Modifier.size(16.dp),
                            )
                        }
                    }
                },
                border = BorderStroke(1.dp, AppColors.Border),
                colors = AssistChipDefaults.assistChipColors(containerColor = AppColors.Surface, labelColor = AppColors.TextPrimary),
            )
        }
    }
}

package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BrokenImage
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.SubcomposeAsyncImage
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

@Immutable
data class AttachmentChipItem(
    val id: String,
    val name: String,
    val isImage: Boolean,
    val url: String? = null,
)

private val PreviewShape = RoundedCornerShape(8.dp)
private val MaxPreviewHeight = 192.dp

/**
 * Renders attachments: images with a URL show as inline previews (rounded, max-height constrained,
 * clickable); non-images or images without a URL show as icon + filename chips.
 * The optional close icon removes items (while composing).
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AttachmentChips(
    items: List<AttachmentChipItem>,
    modifier: Modifier = Modifier,
    onOpen: ((AttachmentChipItem) -> Unit)? = null,
    onRemove: ((AttachmentChipItem) -> Unit)? = null,
) {
    if (items.isEmpty()) return
    val images = items.filter { it.isImage && !it.url.isNullOrBlank() }
    val files = items.filter { !it.isImage || it.url.isNullOrBlank() }
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (images.isNotEmpty()) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                images.forEach { item ->
                    ImagePreview(
                        item = item,
                        onClick = onOpen?.let { open -> { open(item) } },
                        onRemove = onRemove?.let { remove -> { remove(item) } },
                    )
                }
            }
        }
        if (files.isNotEmpty()) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                files.forEach { item ->
                    FileChip(item = item, onOpen = onOpen, onRemove = onRemove)
                }
            }
        }
    }
}

@Composable
private fun ImagePreview(
    item: AttachmentChipItem,
    onClick: (() -> Unit)?,
    onRemove: (() -> Unit)?,
) {
    Box {
        SubcomposeAsyncImage(
            model = item.url,
            contentDescription = item.name,
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .heightIn(max = MaxPreviewHeight)
                .widthIn(max = 240.dp)
                .clip(PreviewShape)
                .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier),
            loading = {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(PreviewShape)
                        .background(AppColors.Surface),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = AppColors.Primary,
                        strokeWidth = 2.dp,
                    )
                }
            },
            error = {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(PreviewShape)
                        .background(AppColors.Surface),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Outlined.BrokenImage,
                        contentDescription = stringResource(R.string.ds_attachment),
                        tint = AppColors.TextSecondary,
                        modifier = Modifier.size(32.dp),
                    )
                }
            },
        )
        if (onRemove != null) {
            IconButton(
                onClick = onRemove,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(24.dp),
            ) {
                Icon(
                    Icons.Outlined.Close,
                    contentDescription = stringResource(R.string.ds_remove_attachment, item.name),
                    tint = AppColors.TextPrimary,
                    modifier = Modifier.size(16.dp),
                )
            }
        }
    }
}

@Composable
private fun FileChip(
    item: AttachmentChipItem,
    onOpen: ((AttachmentChipItem) -> Unit)?,
    onRemove: ((AttachmentChipItem) -> Unit)?,
) {
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

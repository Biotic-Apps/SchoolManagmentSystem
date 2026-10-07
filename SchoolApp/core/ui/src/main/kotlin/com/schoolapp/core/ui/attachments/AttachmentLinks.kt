package com.schoolapp.core.ui.attachments

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.ui.rememberExternalActions

/** Attachment chips that open the signed link in a viewer; [onRemove] (by id) adds a remove icon while composing. */
@Composable
fun AttachmentLinks(
    attachments: List<Attachment>,
    modifier: Modifier = Modifier,
    onRemove: ((String) -> Unit)? = null,
) {
    if (attachments.isEmpty()) return
    val external = rememberExternalActions()
    AttachmentChips(
        items = attachments.map { AttachmentChipItem(it.id, it.name.orEmpty(), it.isImage) },
        modifier = modifier,
        onOpen = { item -> attachments.firstOrNull { it.id == item.id }?.url?.let(external::open) },
        onRemove = onRemove?.let { remove -> { item -> remove(item.id) } },
    )
}

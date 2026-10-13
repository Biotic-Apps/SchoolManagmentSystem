package com.schoolapp.feature.diary.components

import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.model.files.Attachment

internal fun Attachment.toChip(): AttachmentChipItem = AttachmentChipItem(id = id, name = name.orEmpty(), isImage = isImage, url = url)

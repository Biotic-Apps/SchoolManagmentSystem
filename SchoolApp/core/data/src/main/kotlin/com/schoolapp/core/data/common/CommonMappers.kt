package com.schoolapp.core.data.common

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.common.UserRefDto
import com.schoolapp.core.network.dto.files.AttachmentDto

internal fun IdNameDto.toRef(): PersonRef? = if (id == null && name == null) null else PersonRef(id, name.orEmpty())

internal fun UserRefDto.toRef(): PersonRef? {
    val ref = userId ?: id
    return if (ref == null && name == null) null else PersonRef(ref, name.orEmpty())
}

internal fun AttachmentDto.toModel(): Attachment? = id?.let { Attachment(it, url, mime, name ?: originalName) }

internal fun List<AttachmentDto>.toAttachments(): List<Attachment> = mapNotNull { it.toModel() }

/** "Class 5 - A" style label, as used elsewhere in the app. */
internal fun sectionLabel(className: String?, sectionName: String?): String? =
    listOfNotNull(className, sectionName).joinToString(" - ").ifBlank { null }

/** Trimmed text, or null when blank (optional request fields are then left out of the body). */
internal fun String?.clean(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

/** Optional id lists are left out of the body when empty. */
internal fun List<String>.orNullIfEmpty(): List<String>? = takeIf { it.isNotEmpty() }

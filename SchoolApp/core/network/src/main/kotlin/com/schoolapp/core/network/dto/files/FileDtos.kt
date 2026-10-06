package com.schoolapp.core.network.dto.files

import kotlinx.serialization.Serializable

/** `POST /files` result. */
@Serializable
data class UploadedFileDto(
    val id: String,
    val url: String? = null,
    val mime: String? = null,
    val size: Long? = null,
    val name: String? = null,
)

/** File linked to a record (`{ id, url, mime, name }`). */
@Serializable
data class AttachmentDto(
    val id: String? = null,
    val url: String? = null,
    val mime: String? = null,
    val name: String? = null,
    val originalName: String? = null,
)

package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

@Serializable
data class DocumentDto(
    val id: String,
    val ownerType: String? = null,
    val ownerId: String? = null,
    val docType: String = "OTHER",
    val file: FileRefDto? = null,
    val status: String? = null,
    val note: String? = null,
    val verifiedAt: String? = null,
)

@Serializable
data class FileRefDto(val id: String? = null, val url: String? = null, val mime: String? = null, val size: Long? = null)

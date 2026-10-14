package com.schoolapp.core.network.dto.staff.documents

import kotlinx.serialization.Serializable

@Serializable
data class CreateDocumentRequest(
    val ownerType: String,
    val ownerId: String,
    val docType: String,
    val fileId: String,
    val note: String? = null,
)

@Serializable
data class VerifyDocumentRequest(val note: String? = null)

@Serializable
data class RejectDocumentRequest(val reason: String)

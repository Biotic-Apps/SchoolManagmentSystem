package com.schoolapp.core.network.dto.message

import kotlinx.serialization.Serializable

/** `GET /messages/recipients` row; role is CLASS_TEACHER, SUBJECT_TEACHER or PRINCIPAL. */
@Serializable
data class MessageRecipientDto(
    val userId: String,
    val name: String = "",
    val role: String? = null,
    val subjectName: String? = null,
)

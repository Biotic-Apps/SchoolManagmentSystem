package com.schoolapp.core.network.dto.attendance

import kotlinx.serialization.Serializable

/** Body of `PUT /attendance/registers` and `POST /attendance/registers/submit`; also the outbox payload. */
@Serializable
data class RegisterBodyDto(
    val sectionId: String,
    val date: String,
    val entries: List<EntryInputDto>,
    val clientRequestId: String? = null,
)

@Serializable
data class EntryInputDto(val studentId: String, val status: String, val remark: String? = null)

@Serializable
data class CorrectionBodyDto(val entryId: String, val newStatus: String, val reason: String)

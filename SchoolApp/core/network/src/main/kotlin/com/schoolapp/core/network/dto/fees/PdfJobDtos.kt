package com.schoolapp.core.network.dto.fees

import kotlinx.serialization.Serializable

/** `GET /invoices/:id/pdf`: [status] PENDING, READY or FAILED; [fileUrl] is signed and set once READY. */
@Serializable
data class PdfJobDto(val jobId: String? = null, val status: String? = null, val fileUrl: String? = null)

/** `GET /jobs/:id`: [status] e.g. PENDING, RUNNING, DONE, COMPLETED, FAILED; the file is in [result]. */
@Serializable
data class JobStatusDto(
    val id: String? = null,
    val status: String? = null,
    val result: JobResultDto? = null,
    val fileUrl: String? = null,
)

@Serializable
data class JobResultDto(val fileUrl: String? = null, val url: String? = null)

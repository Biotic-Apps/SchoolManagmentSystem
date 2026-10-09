package com.schoolapp.core.data.fees

import com.schoolapp.core.model.fees.PdfJob
import com.schoolapp.core.model.fees.PdfJobState
import com.schoolapp.core.network.dto.fees.JobStatusDto
import com.schoolapp.core.network.dto.fees.PdfJobDto

private val FailedStates = setOf("FAILED", "ERROR", "CANCELLED")

/** A url means READY whatever the status word (READY, DONE, COMPLETED); no url yet keeps polling. */
internal fun jobState(status: String?, fileUrl: String?): PdfJobState = when {
    status?.uppercase() in FailedStates -> PdfJobState.FAILED
    fileUrl.isNullOrBlank() -> PdfJobState.PENDING
    else -> PdfJobState.READY
}

internal fun PdfJobDto.toModel(): PdfJob {
    val url = fileUrl?.takeIf { it.isNotBlank() }
    return PdfJob(jobId, jobState(status, url), url)
}

internal fun JobStatusDto.toPdfJob(): PdfJob {
    val url = (result?.fileUrl ?: result?.url ?: fileUrl)?.takeIf { it.isNotBlank() }
    return PdfJob(id, jobState(status, url), url)
}

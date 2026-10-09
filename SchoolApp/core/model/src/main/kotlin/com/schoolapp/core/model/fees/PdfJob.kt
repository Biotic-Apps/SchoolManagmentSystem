package com.schoolapp.core.model.fees

enum class PdfJobState { PENDING, READY, FAILED }

/** A server-rendered PDF: [fileUrl] (signed) is set when [state] is READY; poll [jobId] while PENDING. */
data class PdfJob(val jobId: String?, val state: PdfJobState, val fileUrl: String?)

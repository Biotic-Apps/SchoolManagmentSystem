package com.schoolapp.feature.payroll.runs.breakdown

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError

/** The breakdown sheet of one staff line; the payslip (for its PDF) is fetched only once the run is approved. */
@Immutable
data class BreakdownState(
    val staffId: String,
    val isLoadingPdf: Boolean = false,
    val pdfUrl: String? = null,
    /** The PDF is still being made (`pdf.status = PENDING`). */
    val pdfPending: Boolean = false,
    val pdfError: AppError? = null,
)

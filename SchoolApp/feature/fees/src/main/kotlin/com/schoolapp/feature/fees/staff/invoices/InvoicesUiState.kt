package com.schoolapp.feature.fees.staff.invoices

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.fees.invoices.InvoiceFilter
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import java.time.YearMonth

@Immutable
data class GenerateSheet(
    val sessionId: String? = null,
    val month: YearMonth,
    val classIds: Set<String> = emptySet(),
    val sessionMissing: Boolean = false,
    val running: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class PrintSheet(
    val month: YearMonth,
    val classId: String? = null,
    val sectionId: String? = null,
    val sections: List<Section> = emptyList(),
    val running: Boolean = false,
    val error: AppError? = null,
)

sealed interface InvoicesNotice {
    data class Generated(val count: Int?) : InvoicesNotice
    data class Issued(val count: Int, val failures: List<String>) : InvoicesNotice
}

@Immutable
data class InvoicesUiState(
    val currentMonth: YearMonth,
    val filter: InvoiceFilter = InvoiceFilter(),
    val search: String = "",
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val invoices: List<Invoice>? = null,
    val classes: List<SchoolClass> = emptyList(),
    val sessions: List<AcademicSession> = emptyList(),
    val selecting: Boolean = false,
    val selected: Set<String> = emptySet(),
    val issuing: Boolean = false,
    val actionError: AppError? = null,
    val notice: InvoicesNotice? = null,
    val generate: GenerateSheet? = null,
    val print: PrintSheet? = null,
    /** One-shot signed url of a finished challan print. */
    val urlToOpen: String? = null,
)

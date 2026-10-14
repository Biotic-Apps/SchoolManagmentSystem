package com.schoolapp.feature.admissions.enquiries

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.model.admissions.EnquiryStatus
import com.schoolapp.feature.admissions.common.AdmissionAccess
import com.schoolapp.feature.admissions.common.AdmissionScope

/** The one sheet or dialog open over the enquiries list. */
sealed interface EnquirySheet {
    data object Add : EnquirySheet
    data class Details(val enquiry: Enquiry) : EnquirySheet
    data class Update(val enquiry: Enquiry) : EnquirySheet
    data class Convert(val enquiry: Enquiry) : EnquirySheet
}

@Immutable
data class EnquiriesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val enquiries: List<Enquiry> = emptyList(),
    val error: AppError? = null,
    val filter: EnquiryStatus? = null,
    val query: String = "",
    val access: AdmissionAccess = AdmissionAccess(),
    /** Branch, active session and classes for "Add enquiry"; loaded when the form first opens. */
    val scope: AdmissionScope? = null,
    val sheet: EnquirySheet? = null,
    val draft: EnquiryDraft = EnquiryDraft(),
    val draftProblems: Set<EnquiryField> = emptySet(),
    val busy: Boolean = false,
    val actionError: AppError? = null,
    val notice: Int? = null,
    /** Set after "Convert to application": the caller opens it. */
    val convertedApplicationId: String? = null,
) {
    val visible: List<Enquiry>
        get() {
            val q = query.trim()
            return enquiries.filter { e ->
                (filter == null || e.status == filter) &&
                    (q.isEmpty() || e.childName.contains(q, true) || e.guardianName.contains(q, true) || e.phone.contains(q))
            }
        }

    val counts: Map<EnquiryStatus, Int> get() = enquiries.groupingBy { it.status }.eachCount()
}

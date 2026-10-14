package com.schoolapp.feature.admissions.confirm

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.admissions.AdmissionFeeStatus
import com.schoolapp.core.model.admissions.ConfirmedAdmission

/** A section of the applied class with its seats used / capacity. */
@Immutable
data class SectionChoice(val id: String, val name: String, val used: Int, val capacity: Int?) {
    val isFull: Boolean get() = capacity != null && used >= capacity
}

enum class ConfirmField { SECTION, DATE, FEE_STATUS, FEE_AMOUNT }

/**
 * Confirm an OFFERED application (`admissions.approve`): section (capacity-checked), admission date and admission
 * fee (paid with amount and receipt no., waived, or pending). Creates the student, guardian sign-ins and enrollment.
 */
@Immutable
data class ConfirmAdmissionUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val childName: String = "",
    val className: String? = null,
    val today: String = "",
    val sections: List<SectionChoice> = emptyList(),
    val sectionId: String? = null,
    val admissionDate: String = "",
    val feeStatus: AdmissionFeeStatus? = null,
    val feeAmount: String = "",
    val feeReference: String = "",
    val problems: Set<ConfirmField> = emptySet(),
    val submitting: Boolean = false,
    val submitError: AppError? = null,
    /** Set once enrolled: shows admission no. and parent sign-in details. */
    val confirmed: ConfirmedAdmission? = null,
) {
    val noSections: Boolean get() = !isLoading && loadError == null && sections.isEmpty()
    val allFull: Boolean get() = sections.isNotEmpty() && sections.all { it.isFull }
}

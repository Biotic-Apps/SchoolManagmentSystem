package com.schoolapp.feature.certificates.review.request

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.people.StudentSummary

@Immutable
data class StudentSearchState(
    val query: String = "",
    val searching: Boolean = false,
    val searched: Boolean = false,
    val results: List<StudentSummary> = emptyList(),
    val error: AppError? = null,
)

/** Office request for any student; ACHIEVEMENT needs the achievement text. */
@Immutable
data class StaffRequestForm(
    val student: StudentSummary? = null,
    val search: StudentSearchState = StudentSearchState(),
    val type: CertificateType? = null,
    val purpose: String = "",
    val achievement: String = "",
    val studentMissing: Boolean = false,
    val typeMissing: Boolean = false,
    val achievementMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

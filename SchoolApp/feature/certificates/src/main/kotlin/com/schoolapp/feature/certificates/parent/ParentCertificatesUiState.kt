package com.schoolapp.feature.certificates.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateType

@Immutable
data class ParentCertificatesUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val childId: String? = null,
    val childName: String? = null,
    val certificates: List<Certificate> = emptyList(),
    val canRequest: Boolean = false,
    val form: RequestForm? = null,
    val requested: Boolean = false,
)

@Immutable
data class RequestForm(
    val type: CertificateType? = null,
    val purpose: String = "",
    /** Required for ACHIEVEMENT certificates. */
    val achievement: String = "",
    val typeMissing: Boolean = false,
    val achievementMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

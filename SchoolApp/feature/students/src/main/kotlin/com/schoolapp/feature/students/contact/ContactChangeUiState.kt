package com.schoolapp.feature.students.contact

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError

@Immutable
data class ContactChangeUiState(
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val fieldError: ContactFieldError? = null,
    val isSubmitting: Boolean = false,
    val submitError: AppError? = null,
    val sent: Boolean = false,
)

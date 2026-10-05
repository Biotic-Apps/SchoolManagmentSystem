package com.schoolapp.feature.profile.password

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError

@Immutable
data class ChangePasswordUiState(
    val current: String = "",
    val new: String = "",
    val confirm: String = "",
    val currentError: PasswordFieldError? = null,
    val newError: PasswordFieldError? = null,
    val confirmError: PasswordFieldError? = null,
    val isSubmitting: Boolean = false,
    val failure: AppError? = null,
    val done: Boolean = false,
)

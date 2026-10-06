package com.schoolapp.feature.profile

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleRef

enum class ProfileFieldError { REQUIRED, TOO_SHORT, INVALID_EMAIL, INVALID_PHONE, CONTACT_REQUIRED }

@Immutable
data class RoleSummary(val role: RoleRef, val roleName: String?, val scope: String?)

@Immutable
data class ProfileUiState(
    val isLoading: Boolean = true,
    val form: ProfileFields = ProfileFields(),
    val original: ProfileFields = ProfileFields(),
    val nameError: ProfileFieldError? = null,
    val emailError: ProfileFieldError? = null,
    val phoneError: ProfileFieldError? = null,
    val roles: List<RoleSummary> = emptyList(),
    val twoFactorEnabled: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
) {
    val hasChanges: Boolean get() = form.trimmed() != original
}

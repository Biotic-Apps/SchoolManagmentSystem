package com.schoolapp.feature.profile.twofactor

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.profile.TwoFactorSetup

enum class CodeFieldError { REQUIRED_TOTP, REQUIRED_ANY, TOO_LONG, INVALID, WRONG }

enum class TwoFactorDialogKind { REGENERATE, DISABLE }

/** One-shot confirmation shown as a snackbar. */
enum class TwoFactorNotice { ENABLED, DISABLED, REGENERATED }

@Immutable
data class TwoFactorDialogState(
    val kind: TwoFactorDialogKind,
    val password: String = "",
    val code: String = "",
    val passwordMissing: Boolean = false,
    val codeError: CodeFieldError? = null,
    /** Disable only: the server does not say whether the password or the code was wrong. */
    val wrongCredentials: Boolean = false,
    val failure: AppError? = null,
    val confirming: Boolean = false,
    val isSubmitting: Boolean = false,
)

@Immutable
data class TwoFactorUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val enabled: Boolean = false,
    val required: Boolean = false,
    val account: String = "",
    val isStarting: Boolean = false,
    val setup: TwoFactorSetup? = null,
    val code: String = "",
    val codeError: CodeFieldError? = null,
    val isEnabling: Boolean = false,
    val actionError: AppError? = null,
    /** Shown once after enabling or regenerating; cleared when the user confirms they saved them. */
    val recoveryCodes: List<String>? = null,
    val dialog: TwoFactorDialogState? = null,
    val notice: TwoFactorNotice? = null,
)

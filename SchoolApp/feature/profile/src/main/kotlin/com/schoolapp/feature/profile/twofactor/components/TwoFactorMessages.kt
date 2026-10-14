package com.schoolapp.feature.profile.twofactor.components

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.CodeFieldError

@StringRes
internal fun CodeFieldError.messageRes(): Int = when (this) {
    CodeFieldError.REQUIRED_TOTP -> R.string.two_factor_error_totp
    CodeFieldError.REQUIRED_ANY -> R.string.two_factor_error_any
    CodeFieldError.TOO_LONG -> R.string.two_factor_error_too_long
    CodeFieldError.INVALID -> R.string.two_factor_error_invalid
    CodeFieldError.WRONG -> R.string.two_factor_error_wrong
}

/** Like [appErrorMessage], but keeps the server's reason for a refusal (e.g. "required for your role"). */
@Composable
@ReadOnlyComposable
internal fun twoFactorErrorMessage(error: AppError): String =
    (error as? AppError.Forbidden)?.message?.takeIf { it.isNotBlank() } ?: appErrorMessage(error)

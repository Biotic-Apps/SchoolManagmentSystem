package com.schoolapp.feature.auth.components

import androidx.annotation.StringRes
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.LoginFieldError
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.TwoFactorFieldError

@StringRes
internal fun LoginFieldError.messageRes(): Int = when (this) {
    LoginFieldError.REQUIRED -> R.string.auth_error_required
    LoginFieldError.INVALID_EMAIL -> R.string.auth_error_invalid_email
    LoginFieldError.TOO_SHORT -> R.string.auth_error_too_short
}

@StringRes
internal fun LoginFailure.messageRes(): Int = when (this) {
    LoginFailure.INVALID_CREDENTIALS -> R.string.auth_failure_credentials
    LoginFailure.NETWORK -> R.string.auth_failure_network
    LoginFailure.NO_ROLE -> R.string.auth_failure_no_role
    LoginFailure.ACCESS_DENIED -> R.string.auth_failure_denied
    LoginFailure.LOCKED -> R.string.auth_failure_locked
    LoginFailure.SERVER -> R.string.auth_failure_server
    LoginFailure.UNKNOWN -> R.string.auth_failure_unknown
    LoginFailure.INVALID_CODE -> R.string.auth_failure_invalid_code
    LoginFailure.CHALLENGE_EXPIRED -> R.string.auth_failure_challenge_expired
    LoginFailure.OTP_INVALID -> R.string.auth_failure_otp_invalid
}

/** A timed-out verification step is a notice rather than an error. */
internal fun LoginFailure.tone(): StatusTone =
    if (this == LoginFailure.CHALLENGE_EXPIRED) StatusTone.Warning else StatusTone.Error

@StringRes
internal fun TwoFactorFieldError.messageRes(): Int = when (this) {
    TwoFactorFieldError.REQUIRED -> R.string.auth_error_required
    TwoFactorFieldError.INVALID_TOTP -> R.string.auth_two_factor_error_totp
    TwoFactorFieldError.INVALID_RECOVERY -> R.string.auth_two_factor_error_recovery
}

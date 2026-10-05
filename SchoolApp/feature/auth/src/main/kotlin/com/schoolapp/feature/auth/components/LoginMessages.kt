package com.schoolapp.feature.auth.components

import androidx.annotation.StringRes
import com.schoolapp.feature.auth.LoginFailure
import com.schoolapp.feature.auth.LoginFieldError
import com.schoolapp.feature.auth.R

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
}

package com.schoolapp.feature.auth.emailcode.components

import androidx.annotation.StringRes
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.emailcode.EmailFieldError

@StringRes
internal fun EmailFieldError.messageRes(): Int = when (this) {
    EmailFieldError.REQUIRED -> R.string.auth_error_required
    EmailFieldError.INVALID_EMAIL -> R.string.auth_email_code_error_invalid
    EmailFieldError.INVALID_CODE -> R.string.auth_email_code_error_code
}

package com.schoolapp.feature.auth.phone.components

import androidx.annotation.StringRes
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.phone.PhoneFieldError

@StringRes
internal fun PhoneFieldError.messageRes(): Int = when (this) {
    PhoneFieldError.REQUIRED -> R.string.auth_error_required
    PhoneFieldError.INVALID_PHONE -> R.string.auth_phone_error_invalid
    PhoneFieldError.INVALID_CODE -> R.string.auth_phone_error_code
}

package com.schoolapp.feature.profile.components

import androidx.annotation.StringRes
import com.schoolapp.feature.profile.ProfileFieldError
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.password.PasswordFieldError

@StringRes
internal fun ProfileFieldError.messageRes(): Int = when (this) {
    ProfileFieldError.REQUIRED -> R.string.profile_error_required
    ProfileFieldError.TOO_SHORT -> R.string.profile_error_name_short
    ProfileFieldError.INVALID_EMAIL -> R.string.profile_error_email
    ProfileFieldError.INVALID_PHONE -> R.string.profile_error_phone
    ProfileFieldError.CONTACT_REQUIRED -> R.string.profile_error_contact
}

@StringRes
internal fun PasswordFieldError.messageRes(): Int = when (this) {
    PasswordFieldError.REQUIRED -> R.string.profile_error_required
    PasswordFieldError.TOO_SHORT -> R.string.password_error_short
    PasswordFieldError.NEEDS_LETTER_AND_DIGIT -> R.string.password_error_mix
    PasswordFieldError.SAME_AS_CURRENT -> R.string.password_error_same
    PasswordFieldError.MISMATCH -> R.string.password_error_mismatch
    PasswordFieldError.WRONG_CURRENT -> R.string.password_error_wrong_current
}

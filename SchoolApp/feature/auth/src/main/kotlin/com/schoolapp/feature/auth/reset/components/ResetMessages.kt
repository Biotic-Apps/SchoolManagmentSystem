package com.schoolapp.feature.auth.reset.components

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.reset.ResetFailure
import com.schoolapp.feature.auth.reset.ResetFieldError

@StringRes
internal fun ResetFieldError.messageRes(): Int = when (this) {
    ResetFieldError.REQUIRED -> R.string.auth_error_required
    ResetFieldError.TOO_SHORT -> R.string.auth_reset_error_short
    ResetFieldError.NEEDS_LETTER_AND_DIGIT -> R.string.auth_reset_error_mix
    ResetFieldError.MISMATCH -> R.string.auth_reset_error_mismatch
}

@Composable
internal fun resetFailureMessage(failure: ResetFailure): String = when (failure) {
    ResetFailure.InvalidCode -> stringResource(R.string.auth_reset_invalid_code)
    is ResetFailure.Error -> appErrorMessage(failure.error)
}

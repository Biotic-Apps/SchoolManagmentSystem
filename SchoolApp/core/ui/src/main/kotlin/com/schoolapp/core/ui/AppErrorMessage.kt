package com.schoolapp.core.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError

/** User-facing text for an [AppError]; server validation/conflict messages are shown as sent. */
@Composable
@ReadOnlyComposable
fun appErrorMessage(error: AppError): String = when (error) {
    AppError.Network -> stringResource(R.string.ui_error_network)
    AppError.Unauthorized -> stringResource(R.string.ui_error_unauthorized)
    is AppError.Forbidden -> stringResource(R.string.ui_error_forbidden)
    is AppError.Validation -> error.message.ifBlank { stringResource(R.string.ui_error_validation) }
    is AppError.Server -> when (error.httpCode) {
        NOT_FOUND -> stringResource(R.string.ui_error_not_found)
        CONFLICT -> error.message ?: stringResource(R.string.ui_error_conflict)
        LOCKED -> error.message ?: stringResource(R.string.ui_error_locked)
        TOO_MANY -> stringResource(R.string.ui_error_rate_limited)
        else -> stringResource(R.string.ui_error_server)
    }
    is AppError.Unknown -> stringResource(R.string.ui_error_unknown)
}

/**
 * Error text for a data-loading context (no form visible).
 * VALIDATION_FAILED is form-centric ("Some details are not valid") which is confusing
 * when it appears on a screen that only loads data. Replace it with a generic load error.
 */
@Composable
@ReadOnlyComposable
fun loadErrorMessage(error: AppError): String = when (error) {
    is AppError.Validation -> stringResource(R.string.ui_error_load)
    else -> appErrorMessage(error)
}

private const val NOT_FOUND = 404
private const val CONFLICT = 409
private const val LOCKED = 423
private const val TOO_MANY = 429

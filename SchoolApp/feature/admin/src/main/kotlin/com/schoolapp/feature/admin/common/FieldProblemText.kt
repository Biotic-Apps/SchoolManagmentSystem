package com.schoolapp.feature.admin.common

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.feature.admin.R

@Composable
@ReadOnlyComposable
fun fieldProblemText(problem: FieldProblem?): String? = when (problem) {
    null -> null
    FieldProblem.REQUIRED -> stringResource(R.string.admin_error_required)
    FieldProblem.TOO_SHORT -> stringResource(R.string.admin_error_too_short)
    FieldProblem.TOO_LONG -> stringResource(R.string.admin_error_too_long)
    FieldProblem.INVALID_CODE -> stringResource(R.string.admin_error_code)
    FieldProblem.INVALID_EMAIL -> stringResource(R.string.admin_error_email)
    FieldProblem.INVALID_PHONE -> stringResource(R.string.admin_error_phone)
    FieldProblem.INVALID_URL -> stringResource(R.string.admin_error_url)
    FieldProblem.CONTACT_REQUIRED -> stringResource(R.string.admin_error_contact)
    FieldProblem.WEAK_PASSWORD -> stringResource(R.string.admin_error_password)
}

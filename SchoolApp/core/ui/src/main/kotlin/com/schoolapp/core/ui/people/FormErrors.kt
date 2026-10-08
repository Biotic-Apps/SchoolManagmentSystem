package com.schoolapp.core.ui.people

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.ui.R

/**
 * Field errors keyed by API path ("child.bForm", "guardians.0.phone", "sectionId"): our own checks first,
 * then the server's VALIDATION_FAILED lines for the same path.
 */
@Immutable
data class FormErrors(
    val problems: Map<String, PersonProblem> = emptyMap(),
    val server: Map<String, String> = emptyMap(),
) {
    val isEmpty: Boolean get() = problems.isEmpty() && server.isEmpty()

    fun has(key: String): Boolean = key in problems || key in server

    /** Clears one field once the user edits it. */
    fun without(key: String) = FormErrors(problems - key, server - key)

    companion object {
        /** Server field errors from a 400 VALIDATION_FAILED. */
        fun fromServer(error: AppError): FormErrors = FormErrors(server = (error as? AppError.Validation)?.fields.orEmpty())
    }
}

@Composable
fun FormErrors.text(key: String): String? = problems[key]?.let { problemText(it) } ?: server[key]

@Composable
fun problemText(problem: PersonProblem): String = stringResource(
    when (problem) {
        PersonProblem.REQUIRED -> R.string.ui_field_required
        PersonProblem.TOO_LONG -> R.string.ui_field_too_long
        PersonProblem.TOO_SHORT -> R.string.ui_field_too_short
        PersonProblem.BAD_DATE -> R.string.ui_field_bad_date
        PersonProblem.FUTURE_DATE -> R.string.ui_field_future_date
        PersonProblem.BAD_ID_NUMBER -> R.string.ui_field_bad_id
        PersonProblem.BAD_PHONE -> R.string.ui_field_bad_phone
        PersonProblem.BAD_EMAIL -> R.string.ui_field_bad_email
        PersonProblem.DUPLICATE_PHONE -> R.string.ui_field_duplicate_phone
    },
)

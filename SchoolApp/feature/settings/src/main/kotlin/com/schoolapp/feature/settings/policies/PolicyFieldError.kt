package com.schoolapp.feature.settings.policies

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.feature.settings.R

/** Inline text for a field: our own problem first, then the server's message for the same key. */
@Composable
internal fun PolicyErrors.text(key: String): String? = when (problem(key)) {
    PolicyProblem.PASSWORD_RANGE -> stringResource(R.string.settings_policies_whole_number, PolicyForm.PASSWORD_MIN, PolicyForm.PASSWORD_MAX)
    PolicyProblem.TIMEOUT_RANGE -> stringResource(R.string.settings_policies_whole_number, PolicyForm.TIMEOUT_MIN, PolicyForm.TIMEOUT_MAX)
    PolicyProblem.TIME -> stringResource(R.string.settings_policies_time_invalid)
    PolicyProblem.TOO_LONG -> stringResource(R.string.settings_policies_too_long, PolicyForm.GRADING_MAX)
    PolicyProblem.MONEY -> stringResource(R.string.settings_policies_money_invalid)
    PolicyProblem.DAYS_RANGE -> stringResource(R.string.settings_policies_days_range)
    null -> server(key)
}

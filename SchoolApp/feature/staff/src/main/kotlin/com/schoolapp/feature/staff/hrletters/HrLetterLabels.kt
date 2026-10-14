package com.schoolapp.feature.staff.hrletters

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.staff.R

/** Same labels as the web `HR_LETTER_TYPE_OPTIONS`; unknown keys are humanized. */
@Composable
internal fun hrLetterTypeLabel(type: String): String = when (type) {
    "EXPERIENCE" -> stringResource(R.string.staff_hr_type_experience)
    "SALARY_CERTIFICATE" -> stringResource(R.string.staff_hr_type_salary)
    "RELIEVING" -> stringResource(R.string.staff_hr_type_relieving)
    "CUSTOM" -> stringResource(R.string.staff_hr_type_custom)
    else -> humanizeKey(type)
}

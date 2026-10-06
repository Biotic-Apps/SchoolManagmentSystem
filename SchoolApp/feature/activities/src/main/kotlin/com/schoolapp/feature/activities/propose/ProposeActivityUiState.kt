package com.schoolapp.feature.activities.propose

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption

@Immutable
data class ProposeActivityUiState(
    val form: ProposeForm = ProposeForm(),
    /** Shown only after the first submit attempt. */
    val errors: Set<ProposeField> = emptySet(),
    val sections: List<SwitcherOption> = emptyList(),
    val sectionsLoading: Boolean = true,
    val sectionsError: AppError? = null,
    val isSubmitting: Boolean = false,
    val submitError: AppError? = null,
    val submitted: Boolean = false,
    val today: String = "",
)

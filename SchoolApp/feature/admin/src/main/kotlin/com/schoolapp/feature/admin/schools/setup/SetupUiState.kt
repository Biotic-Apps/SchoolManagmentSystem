package com.schoolapp.feature.admin.schools.setup

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.schools.SchoolSetupResult
import com.schoolapp.feature.admin.schools.setup.model.SetupDefaults
import com.schoolapp.feature.admin.schools.setup.model.SetupError
import com.schoolapp.feature.admin.schools.setup.model.SetupForm
import com.schoolapp.feature.admin.schools.setup.model.SetupStep

@Immutable
data class SetupUiState(
    val canSetup: Boolean = true,
    val form: SetupForm = SetupDefaults.form(),
    val step: SetupStep = SetupStep.SCHOOL,
    /** Furthest step reached; the step bar lets the admin jump back to any of these. */
    val reached: SetupStep = SetupStep.SCHOOL,
    val errors: Map<String, SetupError> = emptyMap(),
    /** Server text for the banner above the footer, or [bannerRes]. */
    val banner: String? = null,
    val bannerRes: Int? = null,
    /** True after a failed create that could not be explained (generic error banner). */
    val genericError: Boolean = false,
    val isSubmitting: Boolean = false,
    val result: SchoolSetupResult? = null,
    val isDirty: Boolean = false,
) {
    val isReview: Boolean get() = step == SetupStep.REVIEW

    fun error(key: String): SetupError? = errors[key]
}

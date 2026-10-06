package com.schoolapp.feature.students.link

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.GuardianRelation

enum class LinkStep { DETAILS, CODE, DONE }

@Immutable
data class LinkChildUiState(
    val today: String,
    val step: LinkStep = LinkStep.DETAILS,
    val admissionNo: String = "",
    val dob: String? = null,
    val relation: GuardianRelation? = null,
    val code: String = "",
    val errors: Set<LinkFieldError> = emptySet(),
    val requestId: String? = null,
    val maskedPhone: String? = null,
    val devCode: String? = null,
    val isSubmitting: Boolean = false,
    val submitError: AppError? = null,
)

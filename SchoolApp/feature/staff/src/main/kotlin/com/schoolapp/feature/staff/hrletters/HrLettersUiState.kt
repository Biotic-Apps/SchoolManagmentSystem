package com.schoolapp.feature.staff.hrletters

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.staff.hrletters.HrLetter
import com.schoolapp.core.model.staff.hrletters.HrLetterTemplate

data class HrLettersUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val letters: List<HrLetter> = emptyList(),
    /** Active templates of the session's school; empty hides "Generate letter". */
    val templates: List<HrLetterTemplate> = emptyList(),
    val error: AppError? = null,
    val form: GenerateLetterForm? = null,
    val generated: Boolean = false,
    val openingId: String? = null,
    val openUrl: String? = null,
    val actionError: AppError? = null,
)

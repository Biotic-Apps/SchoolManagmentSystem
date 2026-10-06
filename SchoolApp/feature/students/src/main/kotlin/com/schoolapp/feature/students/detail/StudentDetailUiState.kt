package com.schoolapp.feature.students.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.StudentDetail

@Immutable
data class StudentDetailUiState(
    val isLoading: Boolean = true,
    val detail: StudentDetail? = null,
    val error: AppError? = null,
)

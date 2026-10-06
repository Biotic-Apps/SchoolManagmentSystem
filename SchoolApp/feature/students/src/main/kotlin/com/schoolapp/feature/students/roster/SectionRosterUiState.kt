package com.schoolapp.feature.students.roster

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.StudentSummary

@Immutable
data class SectionRosterUiState(
    val title: String,
    val isLoading: Boolean = true,
    val students: List<StudentSummary> = emptyList(),
    val error: AppError? = null,
)

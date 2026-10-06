package com.schoolapp.feature.progress.notes

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.people.StudentSummary

@Immutable
data class ProgressStudentsUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val sections: List<Section> = emptyList(),
    val selectedSectionId: String? = null,
    val isLoadingStudents: Boolean = false,
    val studentsError: AppError? = null,
    val students: List<StudentSummary> = emptyList(),
)

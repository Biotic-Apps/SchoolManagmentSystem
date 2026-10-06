package com.schoolapp.feature.students.sections

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.people.StudentSummary

@Immutable
data class MyClassesUiState(
    val isLoading: Boolean = true,
    val sections: List<Section> = emptyList(),
    val error: AppError? = null,
    val query: String = "",
    val isSearching: Boolean = false,
    val results: List<StudentSummary> = emptyList(),
    val searchError: AppError? = null,
) {
    val showsSearch: Boolean get() = query.isNotBlank()
}

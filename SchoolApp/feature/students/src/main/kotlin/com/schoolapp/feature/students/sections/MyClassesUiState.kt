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
    /** Branch-wide student search; off for teachers/helpers, who browse only their own sections. */
    val canSearch: Boolean = false,
    val query: String = "",
    val isSearching: Boolean = false,
    val results: List<StudentSummary> = emptyList(),
    val searchError: AppError? = null,
) {
    /** Results replace the section list once the query is long enough to search. */
    val showsSearch: Boolean get() = canSearch && query.trim().length >= MIN_SEARCH_LENGTH

    companion object {
        const val MIN_SEARCH_LENGTH = 2
    }
}

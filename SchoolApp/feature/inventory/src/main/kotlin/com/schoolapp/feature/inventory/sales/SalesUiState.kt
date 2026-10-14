package com.schoolapp.feature.inventory.sales

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.inventory.components.LineDraft

/** "Sell to a student": pick a student, add saleable items; prices come from the catalogue. */
@Immutable
data class SalesUiState(
    val student: StudentSummary? = null,
    val search: String = "",
    val results: List<StudentSummary> = emptyList(),
    val isSearching: Boolean = false,
    val searchError: AppError? = null,
    val studentMissing: Boolean = false,
    val lines: List<LineDraft> = listOf(LineDraft(key = 1)),
    val linesError: Int? = null,
    /** NEGATIVE_STOCK text from the server (names the item that ran out). */
    val stockError: String? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

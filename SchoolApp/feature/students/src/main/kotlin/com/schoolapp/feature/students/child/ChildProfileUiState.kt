package com.schoolapp.feature.students.child

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.StudentDetail

@Immutable
data class ChildProfileUiState(
    val isLoading: Boolean = true,
    val childId: String? = null,
    val detail: StudentDetail? = null,
    val error: AppError? = null,
) {
    val hasNoChildren: Boolean get() = !isLoading && childId == null
}

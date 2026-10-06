package com.schoolapp.feature.attendance.mark

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.RegisterStatus

/** One of the marker's sections; [status] is null while its register is still loading. */
@Immutable
data class SectionRegisterRow(
    val sectionId: String,
    val title: String,
    val studentCount: Int,
    val status: RegisterStatus? = null,
    val hasUnsent: Boolean = false,
)

@Immutable
data class MarkHomeUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val date: String = "",
    val today: String = "",
    val sections: List<SectionRegisterRow> = emptyList(),
    val showLeaveReview: Boolean = false,
)

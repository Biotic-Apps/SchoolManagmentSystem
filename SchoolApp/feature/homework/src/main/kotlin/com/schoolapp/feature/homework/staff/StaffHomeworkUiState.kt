package com.schoolapp.feature.homework.staff

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkChange
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.Section

/** Branch › section scope plus the selected section's homework (web: SectionScopeBar + list). */
@Immutable
data class StaffHomeworkUiState(
    val isLoading: Boolean = true,
    val scopeError: AppError? = null,
    /** Only filled when the user is not tied to one branch (super admin) and there is a choice. */
    val branches: List<Branch> = emptyList(),
    val branchId: String? = null,
    val sections: List<Section> = emptyList(),
    val sectionId: String? = null,
    val isListLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val listError: AppError? = null,
    val homework: List<Homework> = emptyList(),
    val canAssign: Boolean = false,
    val change: HomeworkChange? = null,
) {
    val selectedSection: Section? get() = sections.firstOrNull { it.id == sectionId }
}

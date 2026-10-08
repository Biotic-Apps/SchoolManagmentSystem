package com.schoolapp.feature.organisation.classes

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.Subject

/** Read-only Classes overview: one card per class of the branch's active session, plus the subject list. */
@Immutable
data class ClassesUiState(
    val tab: ClassesTab = ClassesTab.CLASSES,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val sessionName: String? = null,
    val classes: List<ClassOverview> = emptyList(),
    val subjects: List<Subject> = emptyList(),
    val error: AppError? = null,
) {
    val hasContent: Boolean get() = classes.isNotEmpty() || subjects.isNotEmpty()
}

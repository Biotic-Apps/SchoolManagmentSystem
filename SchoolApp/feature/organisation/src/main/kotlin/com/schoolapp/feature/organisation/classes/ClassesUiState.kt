package com.schoolapp.feature.organisation.classes

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.ClassOverview

/**
 * Classes overview: one card per class of the branch's active session. [canAdd] / [canReorder] follow
 * `classes.add` / `classes.edit` like the web; [reorder] is the local order while "Reorder" mode is on.
 */
@Immutable
data class ClassesUiState(
    val tab: ClassesTab = ClassesTab.CLASSES,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val sessionId: String? = null,
    val sessionName: String? = null,
    val classes: List<ClassOverview> = emptyList(),
    val error: AppError? = null,
    val canAdd: Boolean = false,
    val canReorder: Boolean = false,
    val addClass: AddClassForm? = null,
    val reorder: List<ClassOverview>? = null,
    val reorderSaving: Boolean = false,
    val actionError: ActionError? = null,
    /** Set once after "Add class": the screen opens Class setup for it, then calls [ClassesViewModel.onClassOpened]. */
    val openClassId: String? = null,
) {
    val hasContent: Boolean get() = classes.isNotEmpty()
    val schoolId: String? get() = branches.firstOrNull { it.id == selectedBranchId }?.schoolId
}

/** "Add class" sheet: name only; the class is appended after the last one. */
@Immutable
data class AddClassForm(
    val name: String = "",
    val nameError: ClassNameProblem? = null,
    val saving: Boolean = false,
    val error: ActionError? = null,
)

enum class ClassNameProblem { REQUIRED, TOO_LONG, DUPLICATE }

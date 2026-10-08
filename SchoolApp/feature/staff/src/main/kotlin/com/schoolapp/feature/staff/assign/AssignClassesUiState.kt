package com.schoolapp.feature.staff.assign

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.ClassAllocation

/** One subject of one section the new teacher should teach. */
data class SubjectPick(val sectionId: String, val subjectId: String)

@Immutable
data class AssignClassesUiState(
    val staffId: String = "",
    val staffName: String = "",
    val canAllocate: Boolean = true,
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val classes: List<SwitcherOption> = emptyList(),
    val selectedClassId: String? = null,
    val classLoading: Boolean = false,
    val classError: AppError? = null,
    /** Setup of every class opened so far, so picks in several classes survive switching. */
    val allocations: Map<String, ClassAllocation> = emptyMap(),
    val classTeacherOf: Set<String> = emptySet(),
    val subjectPicks: Set<SubjectPick> = emptySet(),
    val isSaving: Boolean = false,
    /** Picks the server refused, with the first reason. */
    val failedCount: Int = 0,
    val saveError: AppError? = null,
    val done: Boolean = false,
) {
    val selectedAllocation: ClassAllocation? get() = selectedClassId?.let { allocations[it] }

    val pickCount: Int get() = classTeacherOf.size + subjectPicks.size
}

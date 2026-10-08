package com.schoolapp.feature.organisation.setup

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.SaveStatus
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.model.academics.Room
import com.schoolapp.core.model.academics.SetupSection
import com.schoolapp.core.model.academics.TeachingStaff

/**
 * One class: sections, curriculum and teacher allocation, every change autosaved. Rights come from the server
 * (`canEditStructure`, `canAllocate`) narrowed by the role's permissions ([rights]).
 */
@Immutable
data class ClassSetupUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val setup: ClassSetup? = null,
    val staff: List<TeachingStaff> = emptyList(),
    val rooms: List<Room> = emptyList(),
    val schoolSubjects: List<CatalogueSubject> = emptyList(),
    /** Teaching periods in a week from the bell schedule; null when there is none. */
    val weeklyPeriods: Int? = null,
    val rights: SetupRights = SetupRights(),
    val saveStatus: SaveStatus = SaveStatus.IDLE,
    /** Last failed save that does not belong to one row. */
    val banner: ActionError? = null,
    /** 409 SUBJECT_IN_USE and other per-subject failures, by subject id. */
    val subjectErrors: Map<String, ActionError> = emptyMap(),
    val removeSection: SetupSection? = null,
    val removeError: ActionError? = null,
    val removing: Boolean = false,
    val addingSection: Boolean = false,
    /** Non-null while the class name is being edited. */
    val nameDraft: String? = null,
    val applyingPreset: Boolean = false,
    /** Subject whose "Same for all" is running. */
    val fillingSubjectId: String? = null,
    /** Shows the group chips although no section or subject has a group yet. */
    val groupsRevealed: Boolean = false,
) {
    val subjects: List<ClassSubject> get() = setup?.subjects.orEmpty()
    val sections: List<SetupSection> get() = setup?.sections.orEmpty()

    val showGroups: Boolean
        get() = groupsRevealed || setup?.groups?.isNotEmpty() == true || subjects.any { it.group != null }

    /** Groups offered in pickers: Matric defaults plus any the class already uses. */
    val groupOptions: List<String>
        get() = (LevelPresets.MATRIC_GROUPS + setup?.groups.orEmpty() + subjects.mapNotNull { it.group }).distinct()

    /** School subjects that are not in this class yet ("Add subject…"). */
    val addableSubjects: List<CatalogueSubject>
        get() = schoolSubjects.filter { subject -> subjects.none { it.subjectId == subject.id } }

    /** Σ periods/week a section of each group needs; group-less subjects count for every section. */
    val plannedByGroup: List<Pair<String?, Int>>
        get() {
            val groups = setup?.groups.orEmpty()
            fun sum(group: String?) = subjects.filter { it.group == null || it.group == group }.sumOf { it.periodsPerWeek ?: 0 }
            return if (groups.isEmpty()) listOf(null to sum(null)) else groups.map { it to sum(it) }
        }
}

/** What this user may change here: server flags narrowed by the active role's permissions. */
@Immutable
data class SetupRights(
    val editStructure: Boolean = false,
    val addSection: Boolean = false,
    val removeSection: Boolean = false,
    val createSubject: Boolean = false,
    val createRoom: Boolean = false,
    val allocate: Boolean = false,
)

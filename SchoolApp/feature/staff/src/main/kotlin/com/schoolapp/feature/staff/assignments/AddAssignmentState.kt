package com.schoolapp.feature.staff.assignments

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.staff.assignments.NewStaffAssignment

enum class AssignmentField { KIND, SESSION, SECTION, SUBJECT, VALID_UNTIL }

/** "Add assignment" sheet; which fields apply depends on [kind] (same rules as the web dialog). */
@Immutable
data class AddAssignmentState(
    val kind: String? = null,
    val sessionId: String?,
    val sectionId: String? = null,
    val subjectId: String? = null,
    val responsibleStaffId: String? = null,
    val isSubstitute: Boolean = false,
    val validUntil: String? = null,
    /** Classes with sections of [sessionId]. */
    val classes: List<ClassOverview> = emptyList(),
    val classesLoading: Boolean = false,
    val classesError: AppError? = null,
    val teachers: List<SwitcherOption> = emptyList(),
    val missing: Set<AssignmentField> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val sectionRequired: Boolean get() = kind in NewStaffAssignment.SECTION_KINDS
    val showSubject: Boolean get() = kind == NewStaffAssignment.SUBJECT_TEACHER
    val showResponsible: Boolean get() = kind == NewStaffAssignment.HELPER

    val sectionOptions: List<SwitcherOption>
        get() = classes.flatMap { c -> c.sections.map { s -> SwitcherOption(s.id, "${c.name} - ${s.name}") } }

    /** Subjects of the chosen section's class that are taught in that section (group rules). */
    val subjectOptions: List<SwitcherOption>
        get() {
            val owner = classes.firstOrNull { c -> c.sections.any { it.id == sectionId } } ?: return emptyList()
            val group = owner.sections.first { it.id == sectionId }.group
            return owner.subjects.filter { it.group == null || it.group == group }.map { SwitcherOption(it.id, it.name) }
        }

    fun validate(): Set<AssignmentField> = buildSet {
        if (kind == null) add(AssignmentField.KIND)
        if (sessionId == null) add(AssignmentField.SESSION)
        if (sectionRequired && sectionId == null) add(AssignmentField.SECTION)
        if (showSubject && subjectId == null) add(AssignmentField.SUBJECT)
        if (isSubstitute && validUntil == null) add(AssignmentField.VALID_UNTIL)
    }

    fun toInput(branchId: String) = NewStaffAssignment(
        kind = kind.orEmpty(),
        sessionId = sessionId.orEmpty(),
        branchId = branchId,
        sectionId = sectionId,
        subjectId = subjectId,
        responsibleStaffId = responsibleStaffId,
        validUntil = validUntil,
        isSubstitute = isSubstitute,
    )
}

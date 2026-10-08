package com.schoolapp.core.model.staff

/** `GET /classes/:id/setup`, reduced to what teacher allocation needs. */
data class ClassAllocation(
    val classId: String,
    val className: String,
    val sections: List<AllocationSection>,
    val subjects: List<AllocationSubject>,
    /** Current subject teacher per (sectionId, subjectId). */
    val subjectTeachers: Map<Pair<String, String>, AllocationTeacher>,
    val canAllocate: Boolean,
)

data class AllocationSection(val id: String, val name: String, val group: String?, val classTeacher: AllocationTeacher?)

/** [group] null = taught in every section; otherwise only in sections of that group. */
data class AllocationSubject(val id: String, val name: String, val group: String?) {
    fun appliesTo(section: AllocationSection): Boolean = group == null || group == section.group
}

data class AllocationTeacher(val staffId: String, val name: String)

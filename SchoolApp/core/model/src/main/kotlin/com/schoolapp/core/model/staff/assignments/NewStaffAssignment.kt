package com.schoolapp.core.model.staff.assignments

/** One assignment to add for a staff member in [sessionId] (web "Add assignment" dialog). */
data class NewStaffAssignment(
    val kind: String,
    val sessionId: String,
    val branchId: String,
    val sectionId: String? = null,
    val subjectId: String? = null,
    val responsibleStaffId: String? = null,
    /** ISO date (yyyy-MM-dd) of the last day; only for substitutes. */
    val validUntil: String? = null,
    val isSubstitute: Boolean = false,
) {
    companion object {
        const val SUBJECT_TEACHER = "SUBJECT_TEACHER"
        const val HELPER = "HELPER"

        val KINDS = listOf("CLASS_TEACHER", SUBJECT_TEACHER, HELPER, "COORDINATOR", "HEAD_TEACHER")

        /** Kinds that always target one section; the others may cover the whole branch. */
        val SECTION_KINDS = setOf("CLASS_TEACHER", SUBJECT_TEACHER, HELPER)

        /** Roles that may review a staff member on probation. */
        val REVIEWER_ROLES = setOf("COORDINATOR", "HEAD_TEACHER", "PRINCIPAL")
    }
}

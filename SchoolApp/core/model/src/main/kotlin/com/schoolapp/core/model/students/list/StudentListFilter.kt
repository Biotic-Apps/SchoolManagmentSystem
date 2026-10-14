package com.schoolapp.core.model.students.list

/** Filters of the Students list (web use-students-tab); [status] null means every status. */
data class StudentListFilter(
    val branchId: String? = null,
    val sessionId: String? = null,
    val classId: String? = null,
    val sectionId: String? = null,
    val status: String? = ACTIVE,
    val search: String? = null,
) {
    companion object {
        const val ACTIVE = "ACTIVE"
        val STATUSES = listOf("ACTIVE", "WITHDRAWN", "TRANSFERRED", "GRADUATED")
    }
}

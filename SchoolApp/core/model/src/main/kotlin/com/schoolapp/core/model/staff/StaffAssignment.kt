package com.schoolapp.core.model.staff

data class StaffAssignment(
    val id: String,
    val kind: String,
    val className: String?,
    val sectionName: String?,
    val subjectName: String?,
    val responsibleStaffName: String?,
    val validUntil: String?,
    val isSubstitute: Boolean,
)

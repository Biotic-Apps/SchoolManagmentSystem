package com.schoolapp.core.model.staff

data class StaffSummary(
    val id: String,
    val name: String,
    val photoUrl: String?,
    val employeeNo: String?,
    val designation: String?,
    val branchName: String?,
    val status: String?,
    val roles: List<String>,
    val requiresReview: Boolean,
    val reviewerName: String?,
    val sectionCount: Int,
    val subjectCount: Int,
    /** Login of this staff member; null when they have none (cannot be assigned work by user). */
    val userId: String? = null,
)

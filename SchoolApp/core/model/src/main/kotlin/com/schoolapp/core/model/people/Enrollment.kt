package com.schoolapp.core.model.people

data class Enrollment(
    val id: String,
    val branchName: String?,
    val sessionName: String?,
    val sectionId: String?,
    val className: String?,
    val sectionName: String?,
    val rollNo: Int?,
    val startDate: String?,
    val endDate: String?,
    val status: String?,
)

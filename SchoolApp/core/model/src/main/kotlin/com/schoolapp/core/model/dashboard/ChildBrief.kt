package com.schoolapp.core.model.dashboard

/** The child's identity card on the parent home. */
data class ChildBrief(
    val id: String,
    val name: String,
    val photoUrl: String?,
    val admissionNo: String?,
    val className: String?,
    val sectionName: String?,
    val rollNo: Int?,
    val branchName: String?,
    val branchPhone: String?,
    val classTeacherName: String?,
    val classTeacherUserId: String?,
)

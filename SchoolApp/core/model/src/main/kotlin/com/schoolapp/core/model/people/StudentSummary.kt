package com.schoolapp.core.model.people

data class StudentSummary(
    val id: String,
    val admissionNo: String?,
    val name: String,
    val photoUrl: String?,
    val gender: String?,
    val dob: String?,
    val className: String?,
    val sectionName: String?,
    val sectionId: String?,
    val rollNo: Int?,
    val status: String?,
    val primaryGuardianName: String?,
    val primaryGuardianPhone: String?,
)

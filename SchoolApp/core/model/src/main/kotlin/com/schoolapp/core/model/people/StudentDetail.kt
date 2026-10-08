package com.schoolapp.core.model.people

data class StudentDetail(
    val summary: StudentSummary,
    val branchName: String?,
    val bForm: String?,
    val address: String?,
    val admissionDate: String?,
    val enrollment: Enrollment?,
    val guardians: List<GuardianLink>,
    val documents: List<StudentDocument>,
    val firstName: String? = null,
    val lastName: String? = null,
)

package com.schoolapp.core.model.admissions

data class AdmissionApplication(
    val id: String,
    val applicationNo: String?,
    val status: ApplicationStatus,
    val childName: String,
    val dob: String?,
    val gender: String?,
    val className: String?,
    val previousSchool: String?,
    val guardians: List<ApplicantGuardian>,
    val waitlistPosition: Int?,
    val test: AdmissionTest?,
    val documentCount: Int,
    val decisionReason: String?,
    val createdAt: String?,
)

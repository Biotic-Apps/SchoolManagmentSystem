package com.schoolapp.core.model.admissions

data class ApplicantGuardian(
    val name: String,
    val relation: String?,
    val phone: String?,
    val isPrimary: Boolean,
    val cnic: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
)

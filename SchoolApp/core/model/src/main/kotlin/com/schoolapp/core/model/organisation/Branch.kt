package com.schoolapp.core.model.organisation

data class Branch(
    val id: String,
    val schoolId: String?,
    val schoolName: String?,
    val code: String?,
    val name: String,
    val address: String?,
    val phone: String?,
    val email: String?,
    val timings: BranchTimings?,
    val workingDays: List<Int>,
    val principalName: String?,
    val status: String?,
)

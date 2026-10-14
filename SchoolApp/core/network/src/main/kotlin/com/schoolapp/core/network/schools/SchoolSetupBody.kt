package com.schoolapp.core.network.schools

import kotlinx.serialization.Serializable

/** `POST /schools/setup` body (school-setup-contract §1); null fields are left out. */
@Serializable
data class SchoolSetupBody(
    val school: SetupSchoolBody,
    val branch: SetupBranchBody,
    val principal: SetupPrincipalBody,
    val academics: SetupAcademicsBody,
)

@Serializable
data class SetupSchoolBody(
    val code: String,
    val name: String,
    val phone: String? = null,
    val email: String? = null,
    val website: String? = null,
    val address: String? = null,
)

@Serializable
data class SetupTimingsBody(
    val opensAt: String,
    val closesAt: String,
    val attendanceLockAt: String,
    val staffArrivesAt: String,
    val staffLeavesAt: String,
)

@Serializable
data class SetupBranchBody(
    val name: String,
    val code: String,
    val phone: String? = null,
    val email: String? = null,
    val address: String? = null,
    val timings: SetupTimingsBody,
    val workingDays: List<Int>,
)

@Serializable
data class SetupPrincipalBody(
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val password: String? = null,
)

@Serializable
data class SetupSectionBody(val name: String, val group: String? = null)

@Serializable
data class SetupSubjectBody(val name: String, val periodsPerWeek: Int, val group: String? = null)

@Serializable
data class SetupClassBody(
    val name: String,
    val level: String,
    val sections: List<SetupSectionBody>,
    val subjects: List<SetupSubjectBody>,
)

@Serializable
data class SetupFridayBody(val periodMinutes: Int, val periodsPerDay: Int, val breakMinutes: Int)

@Serializable
data class SetupBellBody(
    val startTime: String,
    val periodMinutes: Int,
    val periodsPerDay: Int,
    val breakAfter: Int,
    val breakMinutes: Int,
    val friday: SetupFridayBody? = null,
)

@Serializable
data class SetupAcademicsBody(
    val createSession: Boolean,
    val sessionName: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val classes: List<SetupClassBody>? = null,
    val bellSchedule: SetupBellBody? = null,
)

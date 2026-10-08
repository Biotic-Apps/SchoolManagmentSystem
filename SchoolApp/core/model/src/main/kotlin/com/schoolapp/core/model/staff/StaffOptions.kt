package com.schoolapp.core.model.staff

/** Fixed lists the API validates against (`staff-input.dto.ts`). */
object StaffOptions {
    val DESIGNATIONS = listOf("TEACHER", "HELPER", "COORDINATOR", "HEAD_TEACHER", "ACCOUNTANT", "OFFICE_STAFF", "OTHER")

    /** Roles a staff login may be created with. */
    val ACCOUNT_ROLES = listOf("TEACHER", "HELPER", "COORDINATOR", "HEAD_TEACHER", "ACCOUNTANT")

    val STATUSES = listOf("ACTIVE", "ON_LEAVE", "RESIGNED", "TERMINATED")

    /** Statuses that disable the sign-in account and end assignments. */
    val LEAVING_STATUSES = setOf("RESIGNED", "TERMINATED")

    /** Designations offered the "Assign classes" step right after adding. */
    val TEACHING_DESIGNATIONS = setOf("TEACHER", "HEAD_TEACHER", "COORDINATOR")

    /** Same default as the API: the designation when it is also a role, else Teacher. */
    fun defaultRoleFor(designation: String?): String = designation?.takeIf { it in ACCOUNT_ROLES } ?: "TEACHER"
}

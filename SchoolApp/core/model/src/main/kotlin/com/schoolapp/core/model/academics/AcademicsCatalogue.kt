package com.schoolapp.core.model.academics

/** `GET /branches/:id/teaching-staff`: candidates for class/subject teacher with their period load. */
data class TeachingStaff(
    val id: String,
    val name: String,
    val designation: String?,
    val hasLogin: Boolean,
    val allocatedPeriods: Int,
    val placedPeriods: Int,
    val sections: Int,
)

/** A branch room. */
data class Room(val id: String, val name: String, val capacity: Int?)

/** A school subject in the master list. */
data class CatalogueSubject(val id: String, val code: String?, val name: String)

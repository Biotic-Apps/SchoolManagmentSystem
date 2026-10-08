package com.schoolapp.core.network.dto.academics

import kotlinx.serialization.Serializable

/** `GET /branches/:id/teaching-staff` item. */
@Serializable
data class TeachingStaffDto(
    val id: String,
    val name: String,
    val designation: String? = null,
    val hasLogin: Boolean = false,
    val allocatedPeriods: Int = 0,
    val placedPeriods: Int = 0,
    val sections: Int = 0,
)

/** `GET /rooms` item and `POST /rooms` / `PATCH /rooms/:id` response. */
@Serializable
data class RoomDto(val id: String, val branchId: String? = null, val name: String, val capacity: Int? = null)

/** `PUT /classes/:id/subjects` response item. */
@Serializable
data class ClassSubjectDto(
    val subjectId: String,
    val code: String? = null,
    val name: String,
    val periodsPerWeek: Int? = null,
    val isOptional: Boolean = false,
    val group: String? = null,
    val sortOrder: Int = 0,
)

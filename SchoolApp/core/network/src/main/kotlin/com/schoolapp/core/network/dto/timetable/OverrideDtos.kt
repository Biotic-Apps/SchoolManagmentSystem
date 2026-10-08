package com.schoolapp.core.network.dto.timetable

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/**
 * `GET /timetable-overrides`: one day substitution. [originalStaff] is null when the slot had no teacher;
 * [className] / [sectionName] / [substituteStaffId] are only sent by some servers.
 */
@Serializable
data class TimetableOverrideDto(
    val id: String,
    val sectionId: String,
    val date: String,
    val periodIndex: Int,
    val originalStaff: IdNameDto? = null,
    val substituteStaff: IdNameDto? = null,
    val substituteStaffId: String? = null,
    val reason: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val createdAt: String? = null,
)

/** `POST /timetable-overrides` (`timetable.edit`); [reason] is 3–300 characters, [periodIndex] 1–20. */
@Serializable
data class CreateOverrideRequest(
    val sectionId: String,
    val date: String,
    val periodIndex: Int,
    val substituteStaffId: String,
    val reason: String,
)

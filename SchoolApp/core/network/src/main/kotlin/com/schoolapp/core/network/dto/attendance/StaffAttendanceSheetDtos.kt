package com.schoolapp.core.network.dto.attendance

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/** `GET` / `PUT /staff-attendance`: one branch day. */
@Serializable
data class StaffAttendanceSheetDto(
    val branchId: String? = null,
    val date: String? = null,
    val entries: List<StaffAttendanceRowDto> = emptyList(),
)

/** One staff row; the API sends `staff { id, name }`, flat `staffId` / `name` are read too. */
@Serializable
data class StaffAttendanceRowDto(
    val staff: IdNameDto? = null,
    val staffId: String? = null,
    val name: String? = null,
    val designation: String? = null,
    val photoUrl: String? = null,
    val status: String? = null,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val remark: String? = null,
)

/** Body of `PUT /staff-attendance`; only marked staff are sent. */
@Serializable
data class StaffAttendanceBodyDto(
    val branchId: String,
    val date: String,
    val entries: List<StaffMarkInputDto>,
)

@Serializable
data class StaffMarkInputDto(
    val staffId: String,
    val status: String,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val remark: String? = null,
)

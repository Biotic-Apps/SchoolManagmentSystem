package com.schoolapp.core.network.dto.staff

import kotlinx.serialization.Serializable

/** `POST /staff` body; nulls are omitted by NetworkJson. */
@Serializable
data class CreateStaffRequest(
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val employeeNo: String? = null,
    val designation: String,
    val joinDate: String,
    val branchId: String,
    val cnic: String? = null,
    val qualification: String? = null,
    val createAccount: Boolean,
    val roleKey: String? = null,
)

/** `PATCH /staff/:id` body; omitted fields are left unchanged. */
@Serializable
data class UpdateStaffRequest(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val employeeNo: String? = null,
    val designation: String? = null,
    val joinDate: String? = null,
    val cnic: String? = null,
    val qualification: String? = null,
)

@Serializable
data class CreatedStaffDto(val staff: StaffDetailDto, val temporaryPassword: String? = null)

@Serializable
data class StaffStatusRequest(val status: String, val effectiveDate: String, val reason: String)

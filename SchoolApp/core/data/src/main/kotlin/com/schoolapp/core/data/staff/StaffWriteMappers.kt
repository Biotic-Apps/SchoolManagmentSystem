package com.schoolapp.core.data.staff

import com.schoolapp.core.model.staff.CreatedStaff
import com.schoolapp.core.model.staff.NewStaffInput
import com.schoolapp.core.model.staff.StaffProfileInput
import com.schoolapp.core.model.staff.StaffStatusChange
import com.schoolapp.core.network.dto.staff.CreateStaffRequest
import com.schoolapp.core.network.dto.staff.CreatedStaffDto
import com.schoolapp.core.network.dto.staff.StaffStatusRequest
import com.schoolapp.core.network.dto.staff.UpdateStaffRequest

private fun String?.clean(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

internal fun NewStaffInput.toRequest() = CreateStaffRequest(
    name = profile.name.trim(),
    email = profile.email.clean(),
    phone = profile.phone.clean(),
    employeeNo = profile.employeeNo.clean(),
    designation = profile.designation,
    joinDate = profile.joinDate,
    branchId = branchId,
    cnic = profile.cnic.clean(),
    qualification = profile.qualification.clean(),
    createAccount = createAccount,
    roleKey = roleKey.takeIf { createAccount },
)

internal fun StaffProfileInput.toUpdateRequest() = UpdateStaffRequest(
    name = name.trim(),
    email = email.clean(),
    phone = phone.clean(),
    employeeNo = employeeNo.clean(),
    designation = designation,
    joinDate = joinDate,
    cnic = cnic.clean(),
    qualification = qualification.clean(),
)

internal fun CreatedStaffDto.toModel() = CreatedStaff(staff.toModel(), temporaryPassword?.takeIf { it.isNotBlank() })

internal fun StaffStatusChange.toRequest() = StaffStatusRequest(status, effectiveDate, reason.trim())

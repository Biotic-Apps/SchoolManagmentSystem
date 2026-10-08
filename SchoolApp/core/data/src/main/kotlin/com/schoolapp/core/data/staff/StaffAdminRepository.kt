package com.schoolapp.core.data.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.CreatedStaff
import com.schoolapp.core.model.staff.NewStaffInput
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffLogin
import com.schoolapp.core.model.staff.StaffProfileInput
import com.schoolapp.core.model.staff.StaffStatusChange

/** Staff writes for principals / admins (`staff.add`, `staff.edit`); same endpoints as the web panel. */
interface StaffAdminRepository {
    suspend fun create(input: NewStaffInput): AppResult<CreatedStaff>
    suspend fun update(id: String, input: StaffProfileInput): AppResult<StaffDetail>
    suspend fun setStatus(id: String, change: StaffStatusChange): AppResult<StaffDetail>

    /** Blank [email] / [phone] fall back to the staff record's; null [roleKey] follows the designation. */
    suspend fun createAccount(id: String, email: String?, phone: String?, roleKey: String?): AppResult<StaffLogin>

    suspend fun resetPassword(id: String): AppResult<StaffLogin>
}

package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.attendance.StaffAttendanceBodyDto
import com.schoolapp.core.network.dto.attendance.StaffAttendanceSheetDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Query

/** Branch staff register (office / principal): view needs `attendance.view`, saving `attendance.approve`. */
interface StaffAttendanceApi {
    @GET("staff-attendance")
    suspend fun sheet(@Query("branchId") branchId: String, @Query("date") date: String): ApiEnvelope<StaffAttendanceSheetDto>

    /** Upserts the sent marks and returns the whole day; holidays answer 400 (non-working day). */
    @PUT("staff-attendance")
    suspend fun save(@Body body: StaffAttendanceBodyDto): ApiEnvelope<StaffAttendanceSheetDto>
}

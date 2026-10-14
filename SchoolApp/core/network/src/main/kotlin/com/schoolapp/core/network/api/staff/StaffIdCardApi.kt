package com.schoolapp.core.network.api.staff

import com.schoolapp.core.network.dto.staff.idcard.StaffIdCardDto
import com.schoolapp.core.network.dto.staff.idcard.StaffIdCardJobDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/** Staff ID card (`staff.view` to read, `staff.edit` to generate / reprint). */
interface StaffIdCardApi {
    @GET("staff/{id}/id-card")
    suspend fun status(@Path("id") staffId: String): ApiEnvelope<StaffIdCardDto>

    @POST("staff/{id}/id-card")
    suspend fun generate(@Path("id") staffId: String): ApiEnvelope<StaffIdCardJobDto>
}

package com.schoolapp.core.network.api.students.detail

import com.schoolapp.core.network.dto.health.HealthProfileDto
import com.schoolapp.core.network.dto.pickup.PickupPersonDto
import com.schoolapp.core.network.dto.students.detail.HealthProfileBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/** Staff actions on the student profile tabs: health profile edit and pickup person verify / revoke. */
interface StudentDetailExtrasApi {
    /** `health.edit`; replaces the whole profile. */
    @PUT("students/{id}/health")
    suspend fun replaceHealth(@Path("id") studentId: String, @Body body: HealthProfileBodyDto): ApiEnvelope<HealthProfileDto?>

    /** `pickup.edit`. */
    @POST("pickup-persons/{id}/verify")
    suspend fun verifyPickupPerson(@Path("id") id: String): ApiEnvelope<PickupPersonDto>

    /** `pickup.edit`; the person is blocked at the gate. */
    @POST("pickup-persons/{id}/revoke")
    suspend fun revokePickupPerson(@Path("id") id: String): ApiEnvelope<PickupPersonDto>
}

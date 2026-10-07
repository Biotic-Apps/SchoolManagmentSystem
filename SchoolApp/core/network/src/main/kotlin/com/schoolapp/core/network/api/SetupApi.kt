package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.setup.SetupChecklistDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Query

interface SetupApi {
    /** Principals may omit [branchId] (their own branch); super admins must pass it. */
    @GET("setup/checklist")
    suspend fun checklist(@Query("branchId") branchId: String? = null): ApiEnvelope<SetupChecklistDto>
}

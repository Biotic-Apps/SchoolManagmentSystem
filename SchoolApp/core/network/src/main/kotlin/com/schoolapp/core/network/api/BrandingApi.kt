package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.branding.BrandingDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.Query

/** Public endpoint (phase5 contract §A): readable before sign-in. */
interface BrandingApi {
    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @GET("branding")
    suspend fun branding(@Query("schoolId") schoolId: String? = null): ApiEnvelope<BrandingDto>
}

package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.me.MeDto
import com.schoolapp.core.network.dto.me.MeUserDto
import com.schoolapp.core.network.dto.me.UpdateMeRequestDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH

interface MeApi {
    @GET("me")
    suspend fun me(): ApiEnvelope<MeDto>

    @PATCH("me")
    suspend fun updateMe(@Body body: UpdateMeRequestDto): ApiEnvelope<MeUserDto>
}

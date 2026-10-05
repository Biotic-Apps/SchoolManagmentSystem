package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.auth.AuthTokensDto
import com.schoolapp.core.network.dto.auth.RefreshRequestDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

/** Called synchronously from the token authenticator on an OkHttp thread. */
interface RefreshApi {
    @POST("auth/refresh")
    fun refresh(@Body body: RefreshRequestDto): Call<ApiEnvelope<AuthTokensDto>>
}

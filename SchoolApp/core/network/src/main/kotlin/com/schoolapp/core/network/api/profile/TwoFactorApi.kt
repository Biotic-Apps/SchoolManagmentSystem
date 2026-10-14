package com.schoolapp.core.network.api.profile

import com.schoolapp.core.network.dto.profile.DisableTwoFactorRequestDto
import com.schoolapp.core.network.dto.profile.RecoveryCodesDto
import com.schoolapp.core.network.dto.profile.TwoFactorCodeRequestDto
import com.schoolapp.core.network.dto.profile.TwoFactorSetupDto
import com.schoolapp.core.network.dto.profile.TwoFactorStatusDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/** Self-service TOTP management for the caller's own account. `{ ok: true }` responses are typed as Unit. */
interface TwoFactorApi {
    @GET("auth/2fa")
    suspend fun status(): ApiEnvelope<TwoFactorStatusDto>

    @POST("auth/2fa/setup")
    suspend fun setup(): ApiEnvelope<TwoFactorSetupDto>

    @POST("auth/2fa/enable")
    suspend fun enable(@Body body: TwoFactorCodeRequestDto): ApiEnvelope<RecoveryCodesDto>

    @POST("auth/2fa/disable")
    suspend fun disable(@Body body: DisableTwoFactorRequestDto)

    @POST("auth/2fa/recovery-codes/regenerate")
    suspend fun regenerateRecoveryCodes(@Body body: TwoFactorCodeRequestDto): ApiEnvelope<RecoveryCodesDto>
}

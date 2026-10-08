package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.auth.AuthTokensDto
import com.schoolapp.core.network.dto.auth.ChangePasswordRequestDto
import com.schoolapp.core.network.dto.auth.DeviceSessionDto
import com.schoolapp.core.network.dto.auth.ForgotPasswordRequestDto
import com.schoolapp.core.network.dto.auth.LoginRequestDto
import com.schoolapp.core.network.dto.auth.LoginResponseDto
import com.schoolapp.core.network.dto.auth.OtpRequestDto
import com.schoolapp.core.network.dto.auth.OtpRequestResponseDto
import com.schoolapp.core.network.dto.auth.OtpVerifyRequestDto
import com.schoolapp.core.network.dto.auth.RefreshRequestDto
import com.schoolapp.core.network.dto.auth.ResetPasswordRequestDto
import com.schoolapp.core.network.dto.auth.TwoFactorVerifyRequestDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.Path

/** Auth endpoints (contract section 1). Endpoints returning `{ ok: true }` are typed as Unit. */
interface AuthApi {

    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequestDto): ApiEnvelope<LoginResponseDto>

    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @POST("auth/2fa/verify")
    suspend fun verifyTwoFactor(@Body body: TwoFactorVerifyRequestDto): ApiEnvelope<AuthTokensDto>

    /** Parent email-code sign-in, step 1 (contract phase 6 §B). */
    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @POST("auth/otp/request")
    suspend fun requestOtp(@Body body: OtpRequestDto): ApiEnvelope<OtpRequestResponseDto>

    /** Parent email-code sign-in, step 2: same result as [login] (tokens or a 2FA challenge). */
    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @POST("auth/otp/verify")
    suspend fun verifyOtp(@Body body: OtpVerifyRequestDto): ApiEnvelope<LoginResponseDto>

    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @POST("auth/password/forgot")
    suspend fun forgotPassword(@Body body: ForgotPasswordRequestDto)

    @Headers("${AuthHeaders.SKIP_AUTH}: true")
    @POST("auth/password/reset")
    suspend fun resetPassword(@Body body: ResetPasswordRequestDto)

    @POST("auth/logout")
    suspend fun logout(@Body body: RefreshRequestDto)

    @POST("auth/logout-all")
    suspend fun logoutAll()

    @POST("auth/password/change")
    suspend fun changePassword(@Body body: ChangePasswordRequestDto)

    @GET("auth/sessions")
    suspend fun sessions(): ApiEnvelope<List<DeviceSessionDto>>

    @DELETE("auth/sessions/{id}")
    suspend fun revokeSession(@Path("id") id: String)
}

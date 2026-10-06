package com.schoolapp.core.data.push

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.DevicesApi
import com.schoolapp.core.network.dto.device.DeviceBodyDto
import javax.inject.Inject
import javax.inject.Singleton

/** Registers this device's push token with `POST /devices`; call after sign-in and when the token rotates. */
@Singleton
class DeviceRegistrar @Inject constructor(
    private val tokenProvider: PushTokenProvider,
    private val api: DevicesApi,
    private val apiCaller: ApiCaller,
) {
    /** Success(false) when this build has no push token (push not configured). */
    suspend fun registerIfAvailable(): AppResult<Boolean> {
        val token = tokenProvider.token()?.takeIf { it.isNotBlank() } ?: return AppResult.Success(false)
        return when (val result = apiCaller.call { api.register(DeviceBodyDto(token)) }) {
            is AppResult.Success -> AppResult.Success(true)
            is AppResult.Failure -> result
        }
    }
}

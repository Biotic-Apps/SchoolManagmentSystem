package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.device.DeviceBodyDto
import retrofit2.http.Body
import retrofit2.http.POST

/** Push device registration (phase 1 `POST /devices`). */
interface DevicesApi {
    @POST("devices")
    suspend fun register(@Body body: DeviceBodyDto)
}

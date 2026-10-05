package com.schoolapp.core.data.profile

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.profile.DeviceSession
import com.schoolapp.core.model.profile.ProfileUpdate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AuthApi
import com.schoolapp.core.network.api.MeApi
import com.schoolapp.core.network.dto.auth.DeviceSessionDto
import com.schoolapp.core.network.dto.me.UpdateMeRequestDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultProfileRepository @Inject constructor(
    private val meApi: MeApi,
    private val authApi: AuthApi,
    private val apiCaller: ApiCaller,
    private val authRepository: AuthRepository,
) : ProfileRepository {

    override suspend fun updateProfile(update: ProfileUpdate): AppResult<Unit> {
        val body = UpdateMeRequestDto(name = update.name, email = update.email, phone = update.phone)
        val result = apiCaller.call { meApi.updateMe(body) }
        if (result is AppResult.Failure) return result
        authRepository.refreshSession()
        return AppResult.Success(Unit)
    }

    override suspend fun deviceSessions(): AppResult<List<DeviceSession>> =
        apiCaller.call { authApi.sessions().data.map { it.toModel() }.sortedByDescending { it.current } }

    override suspend fun revokeSession(id: String): AppResult<Unit> =
        apiCaller.call { authApi.revokeSession(id) }

    private fun DeviceSessionDto.toModel() =
        DeviceSession(id, deviceName, platform, ip, createdAt, lastUsedAt, current)
}

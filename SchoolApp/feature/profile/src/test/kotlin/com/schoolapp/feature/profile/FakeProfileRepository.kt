package com.schoolapp.feature.profile

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.profile.ProfileRepository
import com.schoolapp.core.model.profile.DeviceSession
import com.schoolapp.core.model.profile.ProfileUpdate

class FakeProfileRepository : ProfileRepository {
    val updates = mutableListOf<ProfileUpdate>()
    var nextError: AppError? = null

    override suspend fun updateProfile(update: ProfileUpdate): AppResult<Unit> {
        updates += update
        return nextError?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }

    override suspend fun deviceSessions(): AppResult<List<DeviceSession>> = AppResult.Success(emptyList())

    override suspend fun revokeSession(id: String): AppResult<Unit> = AppResult.Success(Unit)
}

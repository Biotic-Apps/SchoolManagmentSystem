package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.profile.DefaultProfileRepository
import com.schoolapp.core.data.profile.ProfileRepository
import com.schoolapp.core.model.profile.DeviceSession
import com.schoolapp.core.model.profile.ProfileUpdate
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareProfileRepository @Inject constructor(
    private val real: DefaultProfileRepository,
    private val auth: DemoAwareAuthRepository,
) : ProfileRepository {

    override suspend fun updateProfile(update: ProfileUpdate): AppResult<Unit> {
        if (!auth.isDemoActive) return real.updateProfile(update)
        auth.updateDemoUser { user ->
            user.copy(
                fullName = update.name ?: user.fullName,
                email = update.email ?: user.email,
                phone = update.phone ?: user.phone,
            )
        }
        return AppResult.Success(Unit)
    }

    override suspend fun deviceSessions(): AppResult<List<DeviceSession>> =
        if (auth.isDemoActive) AppResult.Success(DemoData.deviceSessions) else real.deviceSessions()

    override suspend fun revokeSession(id: String): AppResult<Unit> =
        if (auth.isDemoActive) AppResult.Success(Unit) else real.revokeSession(id)
}

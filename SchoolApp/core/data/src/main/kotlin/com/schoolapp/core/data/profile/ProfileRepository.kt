package com.schoolapp.core.data.profile

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.profile.DeviceSession
import com.schoolapp.core.model.profile.ProfileUpdate

interface ProfileRepository {
    /** `PATCH /me`, then reloads the session so the new details show everywhere. */
    suspend fun updateProfile(update: ProfileUpdate): AppResult<Unit>

    suspend fun deviceSessions(): AppResult<List<DeviceSession>>

    suspend fun revokeSession(id: String): AppResult<Unit>
}

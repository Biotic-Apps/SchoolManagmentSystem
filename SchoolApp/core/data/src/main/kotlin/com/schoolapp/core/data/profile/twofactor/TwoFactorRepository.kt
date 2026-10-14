package com.schoolapp.core.data.profile.twofactor

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.profile.TwoFactorSetup
import com.schoolapp.core.model.profile.TwoFactorStatus

/** `auth/2fa/...` for the signed-in account. Enable/disable reload the session so the profile chip updates. */
interface TwoFactorRepository {
    suspend fun status(): AppResult<TwoFactorStatus>

    suspend fun startSetup(): AppResult<TwoFactorSetup>

    /** Confirms setup with a 6-digit [code]; returns the one-time recovery codes. */
    suspend fun enable(code: String): AppResult<List<String>>

    /** [code] is a TOTP or a recovery code. */
    suspend fun disable(password: String, code: String): AppResult<Unit>

    suspend fun regenerateRecoveryCodes(code: String): AppResult<List<String>>
}

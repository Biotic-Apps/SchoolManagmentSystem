package com.schoolapp.core.data.profile.twofactor

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.profile.TwoFactorSetup
import com.schoolapp.core.model.profile.TwoFactorStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.profile.TwoFactorApi
import com.schoolapp.core.network.dto.profile.DisableTwoFactorRequestDto
import com.schoolapp.core.network.dto.profile.TwoFactorCodeRequestDto
import javax.inject.Inject
import javax.inject.Singleton

/** [ApiCaller] runs every call on the IO dispatcher. */
@Singleton
class DefaultTwoFactorRepository @Inject constructor(
    private val api: TwoFactorApi,
    private val apiCaller: ApiCaller,
    private val authRepository: AuthRepository,
) : TwoFactorRepository {

    override suspend fun status(): AppResult<TwoFactorStatus> =
        apiCaller.call { api.status().data.let { TwoFactorStatus(it.enabled, it.required) } }

    override suspend fun startSetup(): AppResult<TwoFactorSetup> =
        apiCaller.call { api.setup().data.let { TwoFactorSetup(it.otpauthUrl, it.secret) } }

    override suspend fun enable(code: String): AppResult<List<String>> {
        val result = apiCaller.call { api.enable(TwoFactorCodeRequestDto(code)).data.recoveryCodes }
        if (result is AppResult.Success) authRepository.refreshSession()
        return result
    }

    override suspend fun disable(password: String, code: String): AppResult<Unit> {
        val result = apiCaller.call { api.disable(DisableTwoFactorRequestDto(password, code)) }
        if (result is AppResult.Success) authRepository.refreshSession()
        return result
    }

    override suspend fun regenerateRecoveryCodes(code: String): AppResult<List<String>> =
        apiCaller.call { api.regenerateRecoveryCodes(TwoFactorCodeRequestDto(code)).data.recoveryCodes }
}

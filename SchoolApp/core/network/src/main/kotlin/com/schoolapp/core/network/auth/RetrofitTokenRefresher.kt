package com.schoolapp.core.network.auth

import com.schoolapp.core.model.AuthTokens
import com.schoolapp.core.network.api.RefreshApi
import com.schoolapp.core.network.dto.auth.RefreshRequestDto
import kotlinx.serialization.SerializationException
import timber.log.Timber
import java.io.IOException
import javax.inject.Inject

internal class RetrofitTokenRefresher @Inject constructor(
    private val refreshApi: RefreshApi,
) : TokenRefresher {

    override fun refresh(refreshToken: String): RefreshOutcome = try {
        val response = refreshApi.refresh(RefreshRequestDto(refreshToken)).execute()
        val body = response.body()
        when {
            response.isSuccessful && body != null ->
                RefreshOutcome.Refreshed(AuthTokens(body.data.accessToken, body.data.refreshToken))
            response.code() in REJECTED_CODES -> RefreshOutcome.Rejected
            else -> RefreshOutcome.Unavailable
        }
    } catch (e: IOException) {
        Timber.w(e, "Token refresh failed")
        RefreshOutcome.Unavailable
    } catch (e: SerializationException) {
        Timber.w(e, "Token refresh response unreadable")
        RefreshOutcome.Unavailable
    }

    private companion object {
        val REJECTED_CODES = setOf(400, 401, 403)
    }
}

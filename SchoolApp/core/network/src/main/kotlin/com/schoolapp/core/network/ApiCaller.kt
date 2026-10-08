package com.schoolapp.core.network

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.network.model.ApiErrorCodes
import com.schoolapp.core.network.model.ApiErrorEnvelope
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import kotlin.coroutines.cancellation.CancellationException

/** Runs a Retrofit call on the IO dispatcher and maps failures to [AppError]. */
class ApiCaller @Inject constructor(
    private val json: Json,
    @IoDispatcher private val io: CoroutineDispatcher,
) {
    suspend fun <T> call(block: suspend () -> T): AppResult<T> = withContext(io) {
        try {
            AppResult.Success(block())
        } catch (e: CancellationException) {
            throw e
        } catch (e: HttpException) {
            AppResult.Failure(e.toAppError())
        } catch (e: IOException) {
            AppResult.Failure(AppError.Network)
        } catch (e: SerializationException) {
            AppResult.Failure(AppError.Unknown(e))
        } catch (e: IllegalArgumentException) {
            // Retrofit/converter setup errors (e.g. an unsupported body type) must not crash the app.
            AppResult.Failure(AppError.Unknown(e))
        }
    }

    private fun HttpException.toAppError(): AppError {
        val apiError = runCatching {
            response()?.errorBody()?.string()?.let { json.decodeFromString<ApiErrorEnvelope>(it).error }
        }.getOrNull()
        return when {
            code() == 401 -> AppError.Unauthorized
            code() == 403 -> AppError.Forbidden(apiError?.code, apiError?.message)
            apiError?.code == ApiErrorCodes.VALIDATION_FAILED -> {
                val lines = (apiError.details as? JsonArray)?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull }.orEmpty()
                // class-validator lines read "child.bForm must be 13 digits": the first word is the field path.
                val fields = lines.associateBy({ it.substringBefore(' ') }, { it }).filterKeys { it.isNotBlank() }
                AppError.Validation(lines.firstOrNull().takeIf { apiError.message == GENERIC_VALIDATION } ?: apiError.message, fields)
            }
            else -> AppError.Server(code(), apiError?.code, apiError?.message, apiError?.details?.toString())
        }
    }

    private companion object {
        const val GENERIC_VALIDATION = "Validation failed"
    }
}

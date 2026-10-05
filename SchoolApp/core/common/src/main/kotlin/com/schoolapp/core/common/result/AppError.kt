package com.schoolapp.core.common.result

sealed interface AppError {
    data object Network : AppError
    data object Unauthorized : AppError
    data class Forbidden(val code: String?) : AppError
    data class Validation(val message: String, val fields: Map<String, String> = emptyMap()) : AppError
    data class Server(val httpCode: Int, val code: String?, val message: String?) : AppError
    data class Unknown(val cause: Throwable? = null) : AppError
}

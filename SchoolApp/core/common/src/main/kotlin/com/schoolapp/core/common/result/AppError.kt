package com.schoolapp.core.common.result

sealed interface AppError {
    data object Network : AppError
    data object Unauthorized : AppError
    data class Forbidden(val code: String?, val message: String? = null) : AppError
    data class Validation(val message: String, val fields: Map<String, String> = emptyMap()) : AppError
    /** [details] is the raw JSON of `error.details`, when the server sent one. */
    data class Server(val httpCode: Int, val code: String?, val message: String?, val details: String? = null) : AppError
    data class Unknown(val cause: Throwable? = null) : AppError
}

package com.schoolapp.core.network.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/** Error envelope: `{ error: { code, message, details? } }`. */
@Serializable
data class ApiErrorEnvelope(val error: ApiError)

@Serializable
data class ApiError(
    val code: String,
    val message: String,
    val details: JsonElement? = null,
)

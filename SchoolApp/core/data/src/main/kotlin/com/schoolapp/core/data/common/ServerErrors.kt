package com.schoolapp.core.data.common

import com.schoolapp.core.common.result.AppError
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

/** The API's `error.code` ("SUBJECT_IN_USE", "OWN_ASSIGNMENT" …), or null for network/unknown failures. */
val AppError.serverCode: String?
    get() = when (this) {
        is AppError.Server -> code
        is AppError.Forbidden -> code
        else -> null
    }

/**
 * `error.details` as readable lines: a string array (`["English: 2 teacher assignments"]`), or objects
 * whose `message` is used (conflict lists). Empty when the server sent none.
 */
fun AppError.detailLines(): List<String> {
    val raw = (this as? AppError.Server)?.details ?: return emptyList()
    val element = runCatching { Json.parseToJsonElement(raw) }.getOrNull() as? JsonArray ?: return emptyList()
    return element.mapNotNull { item ->
        when (item) {
            is JsonPrimitive -> item.content.takeIf { item.isString }
            is JsonObject -> (item["message"] as? JsonPrimitive)?.content
            else -> null
        }
    }
}

/** A failed edit plus the server's detail lines, ready for `actionErrorMessage(error, details)`. */
data class ActionError(val error: AppError, val details: List<String> = emptyList())

fun AppError.toActionError(): ActionError = ActionError(this, detailLines())

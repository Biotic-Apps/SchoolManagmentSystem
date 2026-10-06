package com.schoolapp.core.data.common

import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

internal const val STATUS_PENDING_REVIEW = "PENDING_REVIEW"

internal fun JsonObject.string(key: String): String? = (this[key] as? JsonPrimitive)?.takeIf { it.isString }?.content

internal fun JsonObject.boolean(key: String): Boolean? = (this[key] as? JsonPrimitive)?.content?.toBooleanStrictOrNull()

/** Probation / moderation hold: `{ status: "PENDING_REVIEW", approvalId }`. */
internal fun JsonObject.isPendingReview(): Boolean = string("status") == STATUS_PENDING_REVIEW

internal fun JsonObject.approvalId(): String? = string("approvalId")

/**
 * Items of a list that may come as a plain array or wrapped in an object under one of [keys]
 * (e.g. `{ consents: [...], counts }`).
 */
internal fun JsonElement.arrayAt(vararg keys: String): List<JsonElement> = when (this) {
    is JsonArray -> this
    is JsonObject -> keys.firstNotNullOfOrNull { this[it] as? JsonArray } ?: emptyList()
    else -> emptyList()
}

/** Decodes each element, skipping ones that do not match [serializer]. */
internal fun <T> Json.decodeEach(elements: List<JsonElement>, serializer: KSerializer<T>): List<T> =
    elements.mapNotNull { runCatching { decodeFromJsonElement(serializer, it) }.getOrNull() }

/** The object under [key] when present, else this object (e.g. `{ message, deliveredSilently }` vs a bare message). */
internal fun JsonObject.unwrap(key: String): JsonObject = this[key] as? JsonObject ?: this

/** Like [arrayAt] but concatenates every array found under [keys]. */
internal fun JsonElement.allArraysAt(vararg keys: String): List<JsonElement> = when (this) {
    is JsonArray -> this
    is JsonObject -> keys.flatMap { (this[it] as? JsonArray).orEmpty() }
    else -> emptyList()
}

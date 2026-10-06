package com.schoolapp.core.data.approvals

import com.schoolapp.core.common.time.TimeFormat
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

/**
 * Flattens an approval payload into readable `key -> value` rows: nested objects become dotted keys,
 * arrays become their size, ids and empty values are dropped and `HH:mm` times are shown 12-hour.
 */
internal fun JsonObject.toApprovalDetails(prefix: String = ""): List<Pair<String, String>> =
    flatMap { (key, value) -> value.flatten(if (prefix.isEmpty()) key else "$prefix.$key") }
        .filterNot { (key, _) -> key.substringAfterLast('.').isIdKey() }

private fun JsonElement.flatten(key: String): List<Pair<String, String>> = when (this) {
    JsonNull -> emptyList()
    is JsonPrimitive -> content.takeIf { it.isNotBlank() }?.let { listOf(key to it.display()) }.orEmpty()
    is JsonObject -> toApprovalDetails(key)
    is JsonArray -> if (isEmpty()) emptyList() else listOf(key to size.toString())
}

private fun String.display(): String = if (TimeFormat.isTime24h(this)) TimeFormat.formatTime12(this) else this

private fun String.isIdKey(): Boolean = this == "id" || (endsWith("Id") && length > 2)

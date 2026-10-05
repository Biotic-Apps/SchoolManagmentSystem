package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.organisation.BranchSetting
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull

/** Flattens `{ key: value }` settings into display rows; nested objects become `a: b, c: d`, times 12-hour. */
internal fun JsonObject.toSettings(): List<BranchSetting> =
    entries.sortedBy { it.key }.map { (key, value) -> BranchSetting(key, value.display()) }

private fun JsonElement.display(): String = when (this) {
    JsonNull -> "-"
    is JsonPrimitive -> booleanOrNull?.let { if (it) "On" else "Off" } ?: TimeFormat.formatTime12(content)
    is JsonArray -> if (isEmpty()) "-" else joinToString(", ") { it.display() }
    is JsonObject -> if (isEmpty()) "-" else entries.joinToString(", ") { (k, v) -> "$k: ${v.display()}" }
}

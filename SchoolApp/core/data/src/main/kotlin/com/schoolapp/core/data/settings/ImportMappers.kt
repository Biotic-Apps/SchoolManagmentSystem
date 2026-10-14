package com.schoolapp.core.data.settings

import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportRowError
import com.schoolapp.core.model.settings.ImportSummary
import com.schoolapp.core.model.settings.ImportTotals
import com.schoolapp.core.model.settings.ImportValue
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull

/** History may come as a plain array or a page object (`{ items }` / `{ data }`). */
internal fun JsonElement.toImportHistory(): List<ImportSummary> {
    val rows = when (this) {
        is JsonArray -> this
        is JsonObject -> (this["items"] as? JsonArray) ?: (this["data"] as? JsonArray) ?: JsonArray(emptyList())
        else -> JsonArray(emptyList())
    }
    return rows.filterIsInstance<JsonObject>().map { it.toSummary() }.filter { it.id.isNotBlank() }
}

private fun JsonObject.toSummary() = ImportSummary(
    id = text("id") ?: text("importId").orEmpty(),
    kind = text("kind").orEmpty(),
    status = text("status").orEmpty(),
    fileName = text("fileName") ?: text("originalName") ?: text("filename"),
    totals = totals(),
    startedAt = text("startedAt") ?: text("createdAt"),
    startedBy = personName(this["startedBy"] ?: this["createdBy"] ?: this["createdByName"] ?: this["user"]),
)

internal fun JsonObject.toImportDetail(fallbackId: String) = ImportDetail(
    id = text("id") ?: fallbackId,
    kind = text("kind"),
    status = text("status").orEmpty(),
    fileName = text("fileName") ?: text("originalName"),
    totals = totals() ?: ImportTotals(0, 0, 0),
    errors = (this["errors"] as? JsonArray).orEmpty().filterIsInstance<JsonObject>().map {
        ImportRowError(row = it.number("row")?.toInt() ?: 0, column = it.text("column"), message = it.text("message").orEmpty())
    },
    preview = (this["preview"] as? JsonArray).orEmpty().filterIsInstance<JsonObject>().map { row ->
        row.mapValues { (_, value) -> value.toImportValue() }
    },
    reconciliation = (this["reconciliation"] as? JsonObject)?.mapValues { (_, value) -> value.toImportValue() },
    error = text("error"),
)

private fun JsonObject.totals(): ImportTotals? {
    val source = this["totals"] as? JsonObject ?: this
    if (listOf("rows", "valid", "invalid").none { it in source }) return null
    return ImportTotals(source.int("rows"), source.int("valid"), source.int("invalid"))
}

private fun personName(value: JsonElement?): String? = when (value) {
    null, JsonNull -> null
    is JsonPrimitive -> value.content.takeIf { value.isString && it.isNotBlank() }
    is JsonObject -> value.text("name") ?: value.text("fullName") ?: value.text("email")
    else -> null
}

internal fun JsonElement.toImportValue(): ImportValue = when (this) {
    JsonNull -> ImportValue.Empty
    is JsonPrimitive -> when {
        isString -> if (content.isEmpty()) ImportValue.Empty else ImportValue.Text(content)
        booleanOrNull != null -> ImportValue.Bool(booleanOrNull == true)
        doubleOrNull != null -> ImportValue.Number(doubleOrNull ?: 0.0)
        else -> ImportValue.Text(content)
    }
    else -> ImportValue.Json(toString())
}

private fun JsonObject.number(key: String): Double? = (this[key] as? JsonPrimitive)?.let { it.doubleOrNull ?: it.content.toDoubleOrNull() }

private fun JsonObject.int(key: String): Int = (this[key] as? JsonPrimitive)?.intOrNull ?: number(key)?.toInt() ?: 0

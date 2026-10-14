package com.schoolapp.core.network.dto.settings

import com.schoolapp.core.network.NetworkJson
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject

/** The shared Json drops nulls; settings PATCH bodies need them so a cleared field is removed on the server. */
private val WithNulls = Json(from = NetworkJson) { explicitNulls = true }

/** [value] as a JSON object that keeps `null` fields. */
fun <T> settingsBody(serializer: KSerializer<T>, value: T): JsonObject =
    WithNulls.encodeToJsonElement(serializer, value).jsonObject

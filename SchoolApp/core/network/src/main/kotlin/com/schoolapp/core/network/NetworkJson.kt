package com.schoolapp.core.network

import kotlinx.serialization.json.Json

val NetworkJson: Json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
    coerceInputValues = true
    encodeDefaults = true
}

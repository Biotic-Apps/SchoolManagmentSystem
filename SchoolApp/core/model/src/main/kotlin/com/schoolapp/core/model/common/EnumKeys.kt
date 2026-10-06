package com.schoolapp.core.model.common

/** Server enum key -> Kotlin enum; unknown or missing keys give [fallback]. */
inline fun <reified T : Enum<T>> enumOrDefault(key: String?, fallback: T): T =
    enumValues<T>().firstOrNull { it.name == key } ?: fallback

inline fun <reified T : Enum<T>> enumOrNull(key: String?): T? = enumValues<T>().firstOrNull { it.name == key }

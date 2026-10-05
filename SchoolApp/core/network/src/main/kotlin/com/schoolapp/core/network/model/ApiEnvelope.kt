package com.schoolapp.core.network.model

import kotlinx.serialization.Serializable

/** Success envelope: `{ data, meta? }`. */
@Serializable
data class ApiEnvelope<T>(
    val data: T,
    val meta: PageMeta? = null,
)

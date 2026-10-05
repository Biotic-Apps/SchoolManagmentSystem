package com.schoolapp.core.network.model

import kotlinx.serialization.Serializable

@Serializable
data class PageMeta(
    val page: Int? = null,
    val pageSize: Int? = null,
    val total: Int? = null,
    val nextCursor: String? = null,
)

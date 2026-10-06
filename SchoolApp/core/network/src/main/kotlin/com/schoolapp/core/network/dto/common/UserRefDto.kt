package com.schoolapp.core.network.dto.common

import kotlinx.serialization.Serializable

/** Lenient person reference: `{id,name}`, `{userId,name,role}` or both. */
@Serializable
data class UserRefDto(
    val id: String? = null,
    val userId: String? = null,
    val name: String? = null,
    val role: String? = null,
)

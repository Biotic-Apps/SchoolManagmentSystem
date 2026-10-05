package com.schoolapp.core.network.dto.me

import kotlinx.serialization.Serializable

/** Null fields are omitted from the JSON body (NetworkJson has explicitNulls = false). */
@Serializable
data class UpdateMeRequestDto(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
)

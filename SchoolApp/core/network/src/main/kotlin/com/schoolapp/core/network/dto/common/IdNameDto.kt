package com.schoolapp.core.network.dto.common

import kotlinx.serialization.Serializable

@Serializable
data class IdNameDto(val id: String? = null, val name: String? = null)

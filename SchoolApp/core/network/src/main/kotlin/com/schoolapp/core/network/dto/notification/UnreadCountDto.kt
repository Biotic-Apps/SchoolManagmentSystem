package com.schoolapp.core.network.dto.notification

import kotlinx.serialization.Serializable

@Serializable
data class UnreadCountDto(val count: Int = 0)

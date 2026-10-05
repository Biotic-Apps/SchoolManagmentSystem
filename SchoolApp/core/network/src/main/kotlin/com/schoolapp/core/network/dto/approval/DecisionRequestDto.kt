package com.schoolapp.core.network.dto.approval

import kotlinx.serialization.Serializable

@Serializable
data class DecisionRequestDto(val decision: String, val comment: String? = null)

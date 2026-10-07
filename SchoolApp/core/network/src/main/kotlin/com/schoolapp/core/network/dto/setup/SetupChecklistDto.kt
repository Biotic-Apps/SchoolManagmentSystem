package com.schoolapp.core.network.dto.setup

import kotlinx.serialization.Serializable

/** `GET /setup/checklist`. */
@Serializable
data class SetupChecklistDto(
    val branchId: String? = null,
    val complete: Boolean = false,
    val items: List<SetupItemDto> = emptyList(),
)

@Serializable
data class SetupItemDto(
    val key: String? = null,
    val done: Boolean = false,
    val count: Long = 0,
)

package com.schoolapp.core.network.dto.me

import kotlinx.serialization.Serializable

/** `GET /me` payload (docs/api/phase1-contract.md §2). */
@Serializable
data class MeDto(
    val user: MeUserDto,
    val activeRole: String? = null,
    val roles: List<String> = emptyList(),
    val permissions: List<String> = emptyList(),
    val assignments: List<AssignmentDto> = emptyList(),
    val children: List<ChildDto> = emptyList(),
)

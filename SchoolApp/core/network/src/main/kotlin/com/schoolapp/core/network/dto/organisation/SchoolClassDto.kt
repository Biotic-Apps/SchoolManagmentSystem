package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

@Serializable
data class SchoolClassDto(
    val id: String,
    val schoolId: String? = null,
    val name: String,
    val levelOrder: Int? = null,
    val subjectCount: Int = 0,
)

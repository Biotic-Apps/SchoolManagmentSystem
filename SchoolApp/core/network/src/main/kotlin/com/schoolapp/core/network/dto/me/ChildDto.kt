package com.schoolapp.core.network.dto.me

import kotlinx.serialization.Serializable

@Serializable
data class ChildDto(
    val id: String,
    val name: String,
    val className: String? = null,
    val sectionName: String? = null,
    val branchName: String? = null,
)

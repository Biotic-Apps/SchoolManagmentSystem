package com.schoolapp.core.network.dto.me

import kotlinx.serialization.Serializable

@Serializable
data class ChildDto(
    val id: String,
    val name: String,
    val admissionNo: String? = null,
    val photoUrl: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val branchName: String? = null,
    val sessionName: String? = null,
)

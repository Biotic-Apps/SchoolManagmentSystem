package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

@Serializable
data class ChildLinkRequestDto(
    val id: String,
    val guardian: LinkGuardianDto? = null,
    val student: LinkStudentDto? = null,
    val relation: String? = null,
    val status: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class LinkGuardianDto(val id: String? = null, val name: String? = null, val phone: String? = null)

@Serializable
data class LinkStudentDto(
    val id: String? = null,
    val name: String? = null,
    val admissionNo: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
)

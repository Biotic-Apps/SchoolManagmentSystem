package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

@Serializable
data class GuardianDto(
    val id: String,
    val name: String,
    val relation: String? = null,
    val cnic: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
    val userId: String? = null,
    val hasAccount: Boolean = false,
)

@Serializable
data class GuardianLinkDto(
    val id: String,
    val guardian: GuardianDto,
    val relation: String? = null,
    val isPrimary: Boolean = false,
    val status: String? = null,
    val verifiedAt: String? = null,
)

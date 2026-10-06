package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

@Serializable
data class ChildLinkStartBodyDto(val admissionNo: String, val dob: String, val relation: String)

@Serializable
data class ChildLinkChallengeDto(val requestId: String, val maskedPhone: String? = null, val devCode: String? = null)

@Serializable
data class OtpBodyDto(val code: String)

@Serializable
data class ContactChangeBodyDto(val phone: String? = null, val email: String? = null, val address: String? = null)

package com.schoolapp.core.network.dto.profile

import kotlinx.serialization.Serializable

@Serializable
data class TwoFactorStatusDto(val enabled: Boolean = false, val required: Boolean = false)

@Serializable
data class TwoFactorSetupDto(val otpauthUrl: String, val secret: String)

/** [code] is a 6-digit TOTP or, where the endpoint allows it, a recovery code. */
@Serializable
data class TwoFactorCodeRequestDto(val code: String)

@Serializable
data class DisableTwoFactorRequestDto(val password: String, val code: String)

@Serializable
data class RecoveryCodesDto(val recoveryCodes: List<String> = emptyList())

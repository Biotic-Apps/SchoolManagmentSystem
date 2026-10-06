package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

/** [code] carries either the 6-digit TOTP code or a recovery code (contract: "code or recovery code"). */
@Serializable
data class TwoFactorVerifyRequestDto(val challengeId: String, val code: String)

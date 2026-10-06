package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class ForgotPasswordRequestDto(val identifier: String)

package com.schoolapp.core.network.dto.branding

import kotlinx.serialization.Serializable

@Serializable
data class BrandingDto(
    val schoolName: String? = null,
    val logoUrl: String? = null,
    val primaryColor: String? = null,
    val accentSoftColor: String? = null,
    val appName: String? = null,
)

package com.schoolapp.core.model.branding

/** School branding from `GET /branding`; colours are raw hex and must pass the contrast rule before use. */
data class Branding(
    val schoolName: String?,
    val appName: String?,
    val logoUrl: String?,
    val primaryColor: String?,
    val accentSoftColor: String?,
)

package com.schoolapp.core.data.branding

import com.schoolapp.core.model.branding.Branding
import com.schoolapp.core.network.dto.branding.BrandingDto

internal fun BrandingDto.toModel() = Branding(
    schoolName = schoolName.clean(),
    appName = appName.clean(),
    logoUrl = logoUrl.clean(),
    primaryColor = primaryColor.clean(),
    accentSoftColor = accentSoftColor.clean(),
)

private fun String?.clean(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

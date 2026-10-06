package com.schoolapp.feature.home

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import com.schoolapp.core.designsystem.brand.BrandColor
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.branding.Branding

/** Top-bar branding: [name] replaces the default app title, [color] is already contrast-checked. */
@Immutable
data class ShellBrand(
    val name: String? = null,
    val logoUrl: String? = null,
    val color: Color = BrandColor.primaryOrDefault(null),
)

internal fun Branding?.toShellBrand(): ShellBrand = ShellBrand(
    name = this?.appName ?: this?.schoolName,
    logoUrl = this?.logoUrl,
    color = BrandColor.primaryOrDefault(this?.primaryColor),
)

/** School of the active role's assignment; null lets the server use its default school. */
internal fun SessionContext.brandingSchoolId(): String? = activeAssignments.firstNotNullOfOrNull { it.schoolId }

package com.schoolapp.core.network.dto.exams.templates

import kotlinx.serialization.Serializable

@Serializable
data class TemplateLayoutDto(val orientation: String? = null, val paperSize: String? = null)

@Serializable
data class TemplateHeaderDto(
    val showLogo: Boolean = true,
    val schoolName: String? = null,
    val subtitle: String? = null,
    val address: String? = null,
    val phone: String? = null,
)

/** `report-card-templates` row; also the create / update body (id omitted on write). */
@Serializable
data class ReportCardTemplateDto(
    val id: String? = null,
    val name: String = "",
    val isDefault: Boolean = false,
    val layout: TemplateLayoutDto? = null,
    val header: TemplateHeaderDto? = null,
    val showGradingScale: Boolean = true,
    val showSkills: Boolean = true,
    val showRemarks: Boolean = true,
    val showAttendance: Boolean = false,
    val showPosition: Boolean = true,
    val signatures: List<String>? = null,
    val footerText: String? = null,
)

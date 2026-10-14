package com.schoolapp.core.model.exams.templates

/** Report card layout: what the printed card shows. Also the create / update body. */
data class ReportCardTemplate(
    val id: String = "",
    val name: String,
    val isDefault: Boolean = false,
    /** "portrait" or "landscape". */
    val orientation: String = PORTRAIT,
    /** "A4" or "Letter". */
    val paperSize: String = A4,
    val showLogo: Boolean = true,
    val schoolName: String = "",
    val subtitle: String = "",
    val address: String = "",
    val phone: String = "",
    val showGradingScale: Boolean = true,
    val showSkills: Boolean = true,
    val showRemarks: Boolean = true,
    val showAttendance: Boolean = false,
    val showPosition: Boolean = true,
    val signatures: List<String> = DEFAULT_SIGNATURES,
    val footerText: String = "",
) {
    companion object {
        const val PORTRAIT = "portrait"
        const val LANDSCAPE = "landscape"
        const val A4 = "A4"
        const val LETTER = "Letter"
        val DEFAULT_SIGNATURES = listOf("Class teacher", "Principal", "Parent / guardian")
    }
}

package com.schoolapp.feature.settings.school

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.settings.SchoolSettings
import com.schoolapp.core.model.settings.SchoolSettingsInput

/** Editable values of the School & branding form. */
@Immutable
internal data class SchoolForm(
    val displayName: String = "",
    val logoFileId: String? = null,
    /** Preview link of [logoFileId] (the saved logo or a fresh upload). */
    val logoUrl: String? = null,
    val primaryColor: String = BrandColors.DEFAULT_PRIMARY,
    val receiptFooter: String = "",
    val reportCardFooter: String = "",
) {
    val colorPasses: Boolean get() = BrandColors.passes(primaryColor)

    /** Same input the web sends: trimmed, blank footers cleared, colour upper-cased. */
    fun toInput() = SchoolSettingsInput(
        displayName = displayName.trim(),
        logoFileId = logoFileId,
        primaryColor = primaryColor.trim().uppercase(),
        receiptFooter = receiptFooter.trim().ifBlank { null },
        reportCardFooter = reportCardFooter.trim().ifBlank { null },
    )

    /** Compared without the preview link, which changes on every load. */
    fun sameAs(other: SchoolForm): Boolean = copy(logoUrl = null) == other.copy(logoUrl = null)

    companion object {
        fun from(settings: SchoolSettings) = SchoolForm(
            displayName = settings.displayName,
            logoFileId = settings.logoFileId,
            logoUrl = settings.logoUrl,
            primaryColor = settings.primaryColor.uppercase(),
            receiptFooter = settings.receiptFooter.orEmpty(),
            reportCardFooter = settings.reportCardFooter.orEmpty(),
        )
    }
}

@Immutable
internal data class SchoolBrandingUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val settings: SchoolSettings? = null,
    val initial: SchoolForm = SchoolForm(),
    val form: SchoolForm = SchoolForm(),
    val nameMissing: Boolean = false,
    val uploadingLogo: Boolean = false,
    val logoError: AppError? = null,
    val saving: Boolean = false,
    val saved: Boolean = false,
    val saveError: AppError? = null,
    val serverErrors: Map<String, String> = emptyMap(),
) {
    val dirty: Boolean get() = !form.sameAs(initial)
}

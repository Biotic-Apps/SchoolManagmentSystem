package com.schoolapp.feature.admin.schools.edit

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.admin.common.FieldProblem

enum class SchoolField { NAME, PHONE, EMAIL, WEBSITE, ADDRESS }

@Immutable
data class SchoolForm(
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val website: String = "",
    val address: String = "",
)

/** Logo being edited: the saved one, a fresh upload (shown from [previewUri]) or removed. */
@Immutable
data class LogoState(
    val currentUrl: String? = null,
    val uploadedFileId: String? = null,
    val previewUri: String? = null,
    val removed: Boolean = false,
    val isUploading: Boolean = false,
    val uploadError: AppError? = null,
) {
    /** What the logo field shows now (a new upload wins, then the saved one unless removed). */
    val shownUrl: String? get() = previewUri ?: currentUrl.takeUnless { removed }
}

@Immutable
data class SchoolEditUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val canEdit: Boolean = true,
    val code: String = "",
    val form: SchoolForm = SchoolForm(),
    val logo: LogoState = LogoState(),
    val errors: Map<SchoolField, FieldProblem> = emptyMap(),
    /** Server message pinned to a field (409 / validation), shown instead of the local problem. */
    val serverErrors: Map<SchoolField, String> = emptyMap(),
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
    val isDirty: Boolean = false,
)

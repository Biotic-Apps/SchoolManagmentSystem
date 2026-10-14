package com.schoolapp.feature.staff.documents

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.staff.documents.StaffDocument

internal data class StaffDocumentsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val documents: List<StaffDocument> = emptyList(),
    val loadError: AppError? = null,
    /** Non-null while the upload sheet is open. */
    val upload: DocumentUploadForm? = null,
    /** Non-null while a verify / reject dialog is open. */
    val decision: DocumentDecision? = null,
)

internal enum class StaffDocsMessage { UPLOADED, VERIFIED, REJECTED }

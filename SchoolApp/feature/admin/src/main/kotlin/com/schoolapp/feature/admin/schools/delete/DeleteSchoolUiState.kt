package com.schoolapp.feature.admin.schools.delete

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.schools.SchoolDeletionPreview

@Immutable
data class DeleteSchoolUiState(
    val isLoading: Boolean = true,
    val preview: SchoolDeletionPreview? = null,
    val previewError: AppError? = null,
    val confirmText: String = "",
    /** The request is being sent or the background job is still running. */
    val isRunning: Boolean = false,
    val requestError: AppError? = null,
    /** The job finished with FAILED; nothing was removed. [failureDetail] is the server's reason. */
    val failed: Boolean = false,
    val failureDetail: String? = null,
    val deleted: Boolean = false,
) {
    val code: String get() = preview?.code.orEmpty()
    val matches: Boolean get() = preview != null && confirmText.trim() == preview.code
}

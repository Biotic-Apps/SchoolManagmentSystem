package com.schoolapp.feature.staff.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.staff.StaffOptions

/** "Change status" sheet (`POST /staff/:id/status`), same fields as the web dialog. */
@Immutable
data class StatusChangeState(
    val current: String,
    val status: String? = null,
    val effectiveDate: String,
    val reason: String = "",
    val statusMissing: Boolean = false,
    val reasonInvalid: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val options: List<String> get() = StaffOptions.STATUSES.filter { it != current }

    /** Resigned / terminated disable the sign-in and end all class and subject assignments. */
    val leaving: Boolean get() = status in StaffOptions.LEAVING_STATUSES

    companion object {
        const val REASON_MIN = 3
        const val REASON_MAX = 500
    }
}

package com.schoolapp.feature.students.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.feature.students.manage.ManageNotice
import com.schoolapp.feature.students.manage.ManageSheet

/**
 * Student profile. Like the web: placement actions and editing need `students.edit` while the student is
 * enrolled (ACTIVE); linking a guardian needs `students.edit`, editing a guardian `guardians.edit`.
 * The Attendance / Health / Pickup tabs show only with their `.view` permission; documents, ID cards and
 * bulk ID card printing are managed with `students.edit`.
 */
@Immutable
data class StudentDetailUiState(
    val isLoading: Boolean = true,
    val detail: StudentDetail? = null,
    val error: AppError? = null,
    val canEditStudent: Boolean = false,
    val canEditGuardians: Boolean = false,
    val canLinkGuardian: Boolean = false,
    val canViewAttendance: Boolean = false,
    val canViewHealth: Boolean = false,
    val canEditHealth: Boolean = false,
    val canViewPickup: Boolean = false,
    val canEditPickup: Boolean = false,
    val today: String = "",
    val sheet: ManageSheet? = null,
    val notice: ManageNotice? = null,
) {
    /** Edit / change section / transfer / withdraw are offered only to enrolled students. */
    val canAct: Boolean get() = canEditStudent && detail?.summary?.status.let { it == null || it == ACTIVE }

    private companion object {
        const val ACTIVE = "ACTIVE"
    }
}

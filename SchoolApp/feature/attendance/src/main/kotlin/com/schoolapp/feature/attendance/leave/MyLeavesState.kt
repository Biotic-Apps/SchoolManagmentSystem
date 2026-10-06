package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.leave.LeaveRequest

enum class LeaveMessage { SENT, CANCELLED }

/** The caller's own leave requests (scope MINE) plus the open request sheet. */
@Immutable
data class MyLeavesState(
    val isLoading: Boolean = true,
    val items: List<LeaveRequest> = emptyList(),
    val error: AppError? = null,
    val form: LeaveForm? = null,
    val cancellingId: String? = null,
    val message: LeaveMessage? = null,
    val actionError: AppError? = null,
)

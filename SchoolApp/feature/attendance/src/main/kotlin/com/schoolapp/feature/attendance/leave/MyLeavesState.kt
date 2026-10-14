package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveStatus

enum class LeaveMessage { SENT, CANCELLED }

/** The caller's own leave requests (scope MINE), the status filter, the open form and a pending cancel. */
@Immutable
data class MyLeavesState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val items: List<LeaveRequest> = emptyList(),
    val error: AppError? = null,
    /** null = all statuses. */
    val filter: LeaveStatus? = null,
    val form: LeaveForm? = null,
    val confirmCancel: LeaveRequest? = null,
    val cancellingId: String? = null,
    val message: LeaveMessage? = null,
    val actionError: AppError? = null,
    /** Year used for the "days approved" tile. */
    val year: Int = 0,
) {
    val visible: List<LeaveRequest> get() = filter?.let { status -> items.filter { it.status == status } } ?: items

    val summary: LeaveSummary get() = LeaveSummary.of(items, year)
}

/** Header tiles: what is waiting, approved days this year, and rejected requests. */
@Immutable
data class LeaveSummary(val pending: Int, val approvedDays: Int, val rejected: Int, val total: Int) {
    companion object {
        fun of(items: List<LeaveRequest>, year: Int) = LeaveSummary(
            pending = items.count { it.status == LeaveStatus.SUBMITTED },
            approvedDays = items.filter { it.status == LeaveStatus.APPROVED && it.from.startsWith("$year") }.sumOf { it.days },
            rejected = items.count { it.status == LeaveStatus.REJECTED },
            total = items.size,
        )
    }
}

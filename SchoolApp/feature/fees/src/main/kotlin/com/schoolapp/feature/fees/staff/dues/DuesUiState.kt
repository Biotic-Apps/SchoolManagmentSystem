package com.schoolapp.feature.fees.staff.dues

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.DuesRow

@Immutable
data class DuesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val search: String = "",
    val rows: List<DuesRow> = emptyList(),
    /** `fees.edit`: select rows and send reminders to their guardians. */
    val canRemind: Boolean = false,
    val selected: Set<String> = emptySet(),
    val confirmingReminders: Boolean = false,
    val isSending: Boolean = false,
    val remindersSent: Int? = null,
    val actionError: AppError? = null,
) {
    val totalMinor: Long get() = rows.sumOf { it.balanceMinor }
    val allSelected: Boolean get() = rows.isNotEmpty() && rows.all { it.studentId in selected }
}

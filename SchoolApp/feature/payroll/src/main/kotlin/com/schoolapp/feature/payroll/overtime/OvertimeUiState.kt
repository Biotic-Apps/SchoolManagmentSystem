package com.schoolapp.feature.payroll.overtime

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.model.payroll.extras.OvertimeEntry
import com.schoolapp.core.model.payroll.extras.OvertimeMonth
import com.schoolapp.core.model.payroll.extras.OvertimeStatus
import java.time.LocalDate
import java.time.YearMonth

/** What just happened, shown as a success message. */
sealed interface OvertimeNotice {
    data class Found(val count: Int) : OvertimeNotice
    data object Added : OvertimeNotice
    data object Approved : OvertimeNotice
    data object Rejected : OvertimeNotice
    data object Removed : OvertimeNotice
}

enum class OvertimeFormIssue { STAFF, DATE, HOURS, REASON }

@Immutable
data class OvertimeForm(
    val staffId: String? = null,
    val date: String,
    val hours: String = "",
    val reason: String = "",
    val issues: Set<OvertimeFormIssue> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(month: YearMonth): Set<OvertimeFormIssue> = buildSet {
        if (staffId.isNullOrBlank()) add(OvertimeFormIssue.STAFF)
        val day = runCatching { LocalDate.parse(date) }.getOrNull()
        if (day == null || YearMonth.from(day) != month) add(OvertimeFormIssue.DATE)
        if (minutes() == null) add(OvertimeFormIssue.HOURS)
        if (reason.trim().length !in MIN_REASON..MAX_REASON) add(OvertimeFormIssue.REASON)
    }

    /** "2" / "1.5" hours as minutes; null when outside 0.25–16 hours. */
    fun minutes(): Int? {
        val text = hours.trim()
        if (!Regex("^\\d{1,2}(\\.\\d{1,2})?$").matches(text)) return null
        val value = text.toDouble()
        return if (value in MIN_HOURS..MAX_HOURS) Math.round(value * 60).toInt() else null
    }

    companion object {
        const val MIN_REASON = 3
        const val MAX_REASON = 300
        const val MIN_HOURS = 0.25
        const val MAX_HOURS = 16.0
    }
}

@Immutable
data class OvertimeUiState(
    val month: YearMonth,
    val currentMonth: YearMonth,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val data: OvertimeMonth? = null,
    val staffOptions: List<PickerOption> = emptyList(),
    val scanning: Boolean = false,
    val approvingAll: Boolean = false,
    val busyId: String? = null,
    val notice: OvertimeNotice? = null,
    val actionError: AppError? = null,
    val form: OvertimeForm? = null,
    val confirmRemove: OvertimeEntry? = null,
) {
    val canGoNext: Boolean get() = month < currentMonth
    val locked: Boolean get() = data?.locked == true
    val pendingIds: List<String> get() = data?.items.orEmpty().filter { it.status == OvertimeStatus.PENDING }.map { it.id }
}

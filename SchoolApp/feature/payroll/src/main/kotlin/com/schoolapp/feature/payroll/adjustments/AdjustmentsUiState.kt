package com.schoolapp.feature.payroll.adjustments

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.payroll.extras.AdjustmentKind
import com.schoolapp.core.model.payroll.extras.PayrollAdjustment
import java.time.YearMonth

enum class AdjustmentIssue { STAFF, KIND, AMOUNT, REASON }

@Immutable
data class AdjustmentForm(
    val staffId: String? = null,
    val month: YearMonth,
    val kind: AdjustmentKind? = null,
    val amount: String = "",
    val reason: String = "",
    val issues: Set<AdjustmentIssue> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(): Set<AdjustmentIssue> = buildSet {
        if (staffId.isNullOrBlank()) add(AdjustmentIssue.STAFF)
        if (kind == null) add(AdjustmentIssue.KIND)
        if ((MoneyFormat.parse(amount) ?: 0L) <= 0L) add(AdjustmentIssue.AMOUNT)
        if (reason.trim().length !in MIN_REASON..MAX_REASON) add(AdjustmentIssue.REASON)
    }

    companion object {
        const val MIN_REASON = 3
        const val MAX_REASON = 500
    }
}

/** Cancel dialog of one adjustment; the reason needs at least 3 characters. */
@Immutable
data class CancelAdjustment(
    val adjustment: PayrollAdjustment,
    val reason: String = "",
    val showIssue: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

enum class AdjustmentNotice { ADDED, CANCELLED }

@Immutable
data class AdjustmentsUiState(
    val month: YearMonth,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val items: List<PayrollAdjustment>? = null,
    val staffId: String? = null,
    val staffOptions: List<PickerOption> = emptyList(),
    val form: AdjustmentForm? = null,
    val cancel: CancelAdjustment? = null,
    val notice: AdjustmentNotice? = null,
)

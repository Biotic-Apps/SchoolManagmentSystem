package com.schoolapp.feature.payroll.adjustments

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.payroll.extras.AdjustmentKind
import com.schoolapp.core.model.payroll.extras.AdjustmentStatus
import com.schoolapp.feature.payroll.R

@Composable
internal fun kindLabel(kind: AdjustmentKind): String = stringResource(
    when (kind) {
        AdjustmentKind.BONUS -> R.string.payroll_adj_kind_bonus
        AdjustmentKind.ARREAR -> R.string.payroll_adj_kind_arrear
        AdjustmentKind.DEDUCTION -> R.string.payroll_adj_kind_deduction
        AdjustmentKind.ADVANCE -> R.string.payroll_adj_kind_advance
        AdjustmentKind.FINE -> R.string.payroll_adj_kind_fine
    },
)

/** What the kind does to pay, shown under the kind picker. */
@Composable
internal fun kindHint(kind: AdjustmentKind): String = stringResource(
    when (kind) {
        AdjustmentKind.BONUS -> R.string.payroll_adj_hint_bonus
        AdjustmentKind.ARREAR -> R.string.payroll_adj_hint_arrear
        AdjustmentKind.DEDUCTION -> R.string.payroll_adj_hint_deduction
        AdjustmentKind.ADVANCE -> R.string.payroll_adj_hint_advance
        AdjustmentKind.FINE -> R.string.payroll_adj_hint_fine
    },
)

/** Additions read as success, recoveries as warning. */
internal fun kindTone(kind: AdjustmentKind): StatusTone = if (kind.adds) StatusTone.Success else StatusTone.Warning

@Composable
internal fun adjustmentStatusLabel(status: AdjustmentStatus): String = stringResource(
    when (status) {
        AdjustmentStatus.PENDING -> R.string.payroll_adj_status_pending
        AdjustmentStatus.APPLIED -> R.string.payroll_adj_status_applied
        AdjustmentStatus.CANCELLED -> R.string.payroll_adj_status_cancelled
    },
)

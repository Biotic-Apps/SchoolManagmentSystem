package com.schoolapp.feature.reports.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.automirrored.outlined.Grading
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.reports.ReportArea
import com.schoolapp.core.model.reports.ReportJobState
import com.schoolapp.core.model.reports.ReportParam
import com.schoolapp.core.model.reports.ReportParamType
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.reports.R

@Composable
internal fun areaLabel(area: ReportArea): String = stringResource(
    when (area) {
        ReportArea.ATTENDANCE -> R.string.reports_area_attendance
        ReportArea.ACADEMICS -> R.string.reports_area_academics
        ReportArea.FEES -> R.string.reports_area_fees
        ReportArea.PAYROLL -> R.string.reports_area_payroll
        ReportArea.EXPENSES -> R.string.reports_area_expenses
        ReportArea.INVENTORY -> R.string.reports_area_inventory
        ReportArea.BRANCHES -> R.string.reports_area_branches
        ReportArea.OTHER -> R.string.reports_area_other
    },
)

internal fun areaIcon(area: ReportArea): ImageVector = when (area) {
    ReportArea.ATTENDANCE -> Icons.Outlined.EventAvailable
    ReportArea.ACADEMICS -> Icons.AutoMirrored.Outlined.Grading
    ReportArea.FEES -> Icons.AutoMirrored.Outlined.ReceiptLong
    ReportArea.PAYROLL -> Icons.Outlined.Payments
    ReportArea.EXPENSES -> Icons.Outlined.AccountBalanceWallet
    ReportArea.INVENTORY -> Icons.Outlined.Inventory2
    ReportArea.BRANCHES -> Icons.Outlined.Apartment
    ReportArea.OTHER -> Icons.Outlined.Description
}

/** App wording for known params; otherwise the server label, then the humanized name. */
@Composable
internal fun paramLabel(param: ReportParam): String = when {
    param.name == "minDays" -> stringResource(R.string.reports_param_min_days)
    param.name == "from" -> stringResource(R.string.reports_param_from)
    param.name == "to" -> stringResource(R.string.reports_param_to)
    param.type == ReportParamType.BRANCH -> stringResource(R.string.reports_param_branch)
    param.type == ReportParamType.SCHOOL -> stringResource(R.string.reports_param_school)
    param.type == ReportParamType.EXAM -> stringResource(R.string.reports_param_exam)
    param.type == ReportParamType.MONTH -> stringResource(R.string.reports_param_month)
    else -> param.label ?: humanizeKey(param.name)
}

@Composable
internal fun jobStateLabel(state: ReportJobState): String = stringResource(
    when (state) {
        ReportJobState.QUEUED -> R.string.reports_status_queued
        ReportJobState.RUNNING -> R.string.reports_status_running
        ReportJobState.DONE -> R.string.reports_status_done
        ReportJobState.FAILED -> R.string.reports_status_failed
    },
)

internal fun jobStateTone(state: ReportJobState): StatusTone = when (state) {
    ReportJobState.QUEUED -> StatusTone.Neutral
    ReportJobState.RUNNING -> StatusTone.Info
    ReportJobState.DONE -> StatusTone.Success
    ReportJobState.FAILED -> StatusTone.Error
}

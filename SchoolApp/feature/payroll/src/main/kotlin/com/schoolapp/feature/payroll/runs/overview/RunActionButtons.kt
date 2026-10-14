package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.DoneAll
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Print
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.runs.MonthlyPayrollUiState
import com.schoolapp.feature.payroll.runs.RunAction

/** Run actions, each shown only when the status and the role allow it (see [MonthlyPayrollUiState]). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun RunActionButtons(
    state: MonthlyPayrollUiState,
    onCalculate: () -> Unit,
    onPrint: () -> Unit,
    onReview: () -> Unit,
    onSend: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val idle = state.busy == null && !state.calculating
    FlowRow(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.canReview) {
            PrimaryButton(
                stringResource(R.string.payroll_action_mark_reviewed), onReview,
                enabled = idle, loading = state.busy == RunAction.REVIEW, leadingIcon = Icons.Outlined.DoneAll,
            )
        }
        if (state.canSendForApproval) {
            PrimaryButton(
                stringResource(R.string.payroll_send_for_approval), onSend,
                enabled = idle, loading = state.busy == RunAction.APPROVE, leadingIcon = Icons.AutoMirrored.Outlined.Send,
            )
        }
        if (state.canCalculate) {
            SecondaryButton(
                stringResource(if (state.calculateIsFirst) R.string.payroll_action_calculate else R.string.payroll_action_recalculate),
                onCalculate,
                enabled = idle,
                loading = state.busy == RunAction.CALCULATE || state.calculating,
                leadingIcon = Icons.Outlined.Calculate,
            )
        }
        if (state.canPrint) {
            SecondaryButton(
                stringResource(R.string.payroll_action_print_all), onPrint,
                enabled = state.busy == null, loading = state.busy == RunAction.PRINT, leadingIcon = Icons.Outlined.Print,
            )
        }
        if (state.canClose) {
            SecondaryButton(
                stringResource(R.string.payroll_action_close), onClose,
                enabled = idle && state.closeEnabled, loading = state.busy == RunAction.CLOSE, leadingIcon = Icons.Outlined.Lock,
            )
        }
    }
}

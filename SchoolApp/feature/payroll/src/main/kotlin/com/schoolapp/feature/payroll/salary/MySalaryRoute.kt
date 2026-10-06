package com.schoolapp.feature.payroll.salary

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.MonthHeader
import com.schoolapp.feature.payroll.components.label

/** Menu `my_salary`: "Salary" and "Attendance & Leave" tabs; FLAG_SECURE while the screen is composed. */
@Composable
internal fun MySalaryRoute(
    attendanceContent: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MySalaryViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SecureWindowEffect(state.secure)
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(stringResource(R.string.payroll_tab_salary), stringResource(R.string.payroll_tab_attendance)),
            selectedIndex = tab,
            onSelect = { tab = it },
            modifier = Modifier.fillMaxWidth(),
        )
        if (tab == 0) {
            SalaryTab(
                state = state,
                onPreviousMonth = viewModel::onPreviousMonth,
                onNextMonth = viewModel::onNextMonth,
                onRetry = viewModel::retry,
                modifier = Modifier.weight(1f),
            )
        } else {
            Column(Modifier.weight(1f)) { attendanceContent() }
        }
    }
}

@Composable
internal fun SalaryTab(
    state: MySalaryUiState,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val actions = rememberExternalActions()
    ScreenColumn(modifier) {
        item(key = "month") { MonthHeader(state.month, state.canGoNext, onPreviousMonth, onNextMonth) }
        val payslip = state.payslip
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            payslip != null -> item(key = "payslip") { PayslipCard(payslip, onDownload = actions::open) }
            else -> item(key = "empty") {
                EmptyState(
                    title = stringResource(R.string.payroll_no_payslip, state.month.label()),
                    message = stringResource(R.string.payroll_no_payslip_message),
                    icon = Icons.AutoMirrored.Outlined.ReceiptLong,
                )
            }
        }
    }
}

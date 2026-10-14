package com.schoolapp.feature.payroll

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
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
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.adjustments.AdjustmentsTab
import com.schoolapp.feature.payroll.overtime.OvertimeTab
import com.schoolapp.feature.payroll.rules.PayRulesTab
import com.schoolapp.feature.payroll.runs.MonthlyPayrollTab
import com.schoolapp.feature.payroll.salary.MySalaryRoute
import com.schoolapp.feature.payroll.scope.PayrollBranchBar
import com.schoolapp.feature.payroll.scope.PayrollScopeViewModel
import com.schoolapp.feature.payroll.setup.SalarySetupTab

/**
 * Menu `payroll` (principal, coordinator, accountant, super admin): monthly payroll runs, salary setup, overtime,
 * bonus & deductions and pay rules for the selected branch. Salaries are listed, so the window is FLAG_SECURE.
 */
@Composable
fun PayrollMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, onOpenApprovals: (() -> Unit)?, modifier: Modifier = Modifier) {
    val scopeViewModel: PayrollScopeViewModel = hiltViewModel(key = "payroll_scope_${role.key}")
    val scope by scopeViewModel.state.collectAsStateWithLifecycle()
    SecureWindowEffect(true)
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val branch = scope.branch
    val session = scope.session
    Column(modifier.fillMaxSize()) {
        PayrollBranchBar(scope, scopeViewModel::select)
        when {
            !scope.ready -> LoadingState()
            scope.error != null && branch == null -> ErrorState(appErrorMessage(scope.error!!), onRetry = scopeViewModel::retry)
            branch == null || session == null -> EmptyState(
                title = stringResource(R.string.payroll_no_branch),
                message = stringResource(R.string.payroll_no_branch_message),
            )
            else -> {
                AppTabs(
                    titles = listOf(
                        stringResource(R.string.payroll_tab_monthly),
                        stringResource(R.string.payroll_tab_setup),
                        stringResource(R.string.payroll_tab_overtime),
                        stringResource(R.string.payroll_tab_adjustments),
                        stringResource(R.string.payroll_tab_rules),
                    ),
                    selectedIndex = tab,
                    onSelect = { tab = it },
                )
                key(branch.id) {
                    val content = Modifier.weight(1f)
                    when (tab) {
                        0 -> MonthlyPayrollTab(branch, session, onOpenApprovals, content)
                        1 -> SalarySetupTab(branch, session, onOpen, content)
                        2 -> OvertimeTab(branch, session, content)
                        3 -> AdjustmentsTab(branch, session, content)
                        else -> PayRulesTab(branch, session, content)
                    }
                }
            }
        }
    }
}

/** Menu `my_salary`: payslips plus [attendanceContent] (own attendance and leave from :feature:attendance). */
@Composable
fun MySalaryScreen(attendanceContent: @Composable () -> Unit, modifier: Modifier = Modifier) {
    MySalaryRoute(attendanceContent, modifier)
}

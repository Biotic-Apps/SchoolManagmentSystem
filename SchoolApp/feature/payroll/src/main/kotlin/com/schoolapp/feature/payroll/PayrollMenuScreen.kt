package com.schoolapp.feature.payroll

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.payroll.runs.PayrollRunsRoute
import com.schoolapp.feature.payroll.salary.MySalaryRoute

/** Menu `payroll`: payroll run status by month; approval happens in Approvals. */
@Composable
fun PayrollMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, onOpenApprovals: (() -> Unit)?, modifier: Modifier = Modifier) {
    PayrollRunsRoute(
        onOpenRun = { onOpen(PayrollRunDestination(it)) },
        onOpenApprovals = onOpenApprovals,
        modifier = modifier,
        viewModel = hiltViewModel(key = "payroll_${role.key}"),
    )
}

/** Menu `my_salary`: payslips plus [attendanceContent] (own attendance and leave from :feature:attendance). */
@Composable
fun MySalaryScreen(attendanceContent: @Composable () -> Unit, modifier: Modifier = Modifier) {
    MySalaryRoute(attendanceContent, modifier)
}

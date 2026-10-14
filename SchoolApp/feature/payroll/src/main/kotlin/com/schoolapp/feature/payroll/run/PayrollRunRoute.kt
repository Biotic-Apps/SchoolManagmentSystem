package com.schoolapp.feature.payroll.run

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.runs.MonthlyPayrollContent
import com.schoolapp.feature.payroll.runs.MonthlyPayrollViewModel

/** One payroll run opened from a link (`PayrollRunDestination.runId`): the same actions and lines as the tab (FLAG_SECURE). */
@Composable
internal fun PayrollRunRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onOpenApprovals: (() -> Unit)? = null,
    viewModel: MonthlyPayrollViewModel = hiltViewModel(),
) {
    SecureWindowEffect(true)
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(title = stringResource(R.string.payroll_run_title), navigationIcon = { BackButton(onBack) })
        },
    ) { padding ->
        MonthlyPayrollContent(viewModel, onOpenApprovals, Modifier.padding(padding))
    }
}

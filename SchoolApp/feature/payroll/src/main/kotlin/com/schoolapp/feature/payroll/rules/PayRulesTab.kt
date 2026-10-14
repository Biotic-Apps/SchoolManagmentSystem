package com.schoolapp.feature.payroll.rules

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R

/** "Pay rules": school-wide rules for absences, lates and overtime, with a live worked example. */
@Composable
internal fun PayRulesTab(
    branch: FinanceBranch,
    session: SessionContext,
    modifier: Modifier = Modifier,
    viewModel: PayRulesViewModel = hiltViewModel(key = "payroll_rules_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch.id) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    // Coordinators work at branch level, so school-wide rules stay read-only for them.
    val canEdit = session.has(PAYROLL_APPROVE) && session.activeRole != RoleKey.COORDINATOR
    val view = state.view
    val rules = state.rules
    when {
        state.isLoading && view == null -> LoadingState(modifier)
        view == null || rules == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), modifier, onRetry = viewModel::retry)
        else -> ScreenColumn(modifier) {
            if (!view.saved) item(key = "defaults") { InlineMessage(stringResource(R.string.payroll_rules_defaults), StatusTone.Info) }
            if (!canEdit) item(key = "read_only") { InlineMessage(stringResource(R.string.payroll_rules_read_only), StatusTone.Info) }
            item(key = "days") { WorkingDaysCard(rules, canEdit, viewModel::edit) }
            item(key = "lates") { LatesCard(rules, canEdit, viewModel::edit) }
            item(key = "overtime") {
                OvertimeRulesCard(
                    rules = rules,
                    view = view,
                    dailyHours = state.dailyHours,
                    dailyHoursInvalid = state.dailyHoursInvalid,
                    enabled = canEdit,
                    onEdit = viewModel::edit,
                    onDailyHours = viewModel::onDailyHours,
                )
            }
            item(key = "example") { PayRulesExample(rules, state.dailyHours.toDoubleOrNull() ?: view.branchDailyHours ?: DEFAULT_HOURS) }
            state.saveError?.let { item(key = "save_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            if (state.saved) item(key = "saved") { InlineMessage(stringResource(R.string.payroll_rules_saved), StatusTone.Success) }
            if (canEdit) {
                item(key = "save") { PrimaryButton(stringResource(R.string.payroll_rules_save), viewModel::save, loading = state.isSaving) }
            }
        }
    }
}

private const val PAYROLL_APPROVE = "payroll.approve"
private const val DEFAULT_HOURS = 8.0

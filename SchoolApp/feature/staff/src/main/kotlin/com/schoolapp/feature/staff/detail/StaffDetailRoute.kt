package com.schoolapp.feature.staff.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.account.StaffAccountCard
import com.schoolapp.feature.staff.account.StaffAccountDialogs
import com.schoolapp.feature.staff.account.StaffAccountViewModel
import com.schoolapp.feature.staff.account.showsCardFor

@Composable
fun StaffDetailRoute(
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onAssign: (staffId: String, name: String, branchId: String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffDetailViewModel = hiltViewModel(),
    accountViewModel: StaffAccountViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val account by accountViewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.detail?.summary?.name ?: stringResource(R.string.staff_detail_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val detail = state.detail
        when {
            state.isLoading -> LoadingState(body)
            state.error != null -> ErrorState(appErrorMessage(state.error!!), body, onRetry = viewModel::load)
            detail != null -> ScreenColumn(body) {
                val s = detail.summary
                item(key = "profile") { StaffProfileCard(detail) }
                if (state.canEdit || state.canAssign) {
                    item(key = "actions") {
                        StaffActionsRow(
                            onEdit = { onEdit(s.id) }.takeIf { state.canEdit },
                            onStatus = viewModel::openStatusChange.takeIf { state.canChangeStatus },
                            onAssign = { onAssign(s.id, s.name, s.branchId.orEmpty()) }.takeIf { state.canAssign },
                        )
                    }
                }
                if (account.showsCardFor(detail)) {
                    item(key = "account") {
                        StaffAccountCard(
                            detail = detail,
                            state = account,
                            isSelf = state.isSelf,
                            onCreate = { accountViewModel.openCreate(detail) },
                            onReset = accountViewModel::askReset,
                        )
                    }
                }
                item(key = "probation") { ProbationCard(s.requiresReview, s.reviewerName) }
                state.workload?.let { w -> item(key = "workload") { WorkloadCard(w) } }
                item(key = "assignments") { AssignmentsCard(detail.assignments) }
                item(key = "hint") {
                    Text(stringResource(R.string.staff_web_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
    state.detail?.let { d -> StaffAccountDialogs(d.summary.name, d.email ?: d.phone, account, accountViewModel) }
    val sheet = state.statusChange
    if (sheet != null && state.detail != null) {
        StatusChangeSheet(
            name = state.detail!!.summary.name,
            state = sheet,
            onStatus = viewModel::onStatus,
            onDate = viewModel::onEffectiveDate,
            onReason = viewModel::onReason,
            onSubmit = viewModel::submitStatusChange,
            onDismiss = viewModel::closeStatusChange,
        )
    }
}

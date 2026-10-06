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

@Composable
fun StaffDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
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
                item(key = "profile") { StaffProfileCard(detail) }
                item(key = "probation") { ProbationCard(detail.summary.requiresReview, detail.summary.reviewerName) }
                state.workload?.let { w -> item(key = "workload") { WorkloadCard(w) } }
                item(key = "assignments") { AssignmentsCard(detail.assignments) }
                item(key = "hint") {
                    Text(stringResource(R.string.staff_web_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

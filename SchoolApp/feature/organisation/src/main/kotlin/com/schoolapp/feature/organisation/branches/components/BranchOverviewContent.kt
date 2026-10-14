package com.schoolapp.feature.organisation.branches.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.feature.organisation.components.RefreshErrorBanner

@Composable
internal fun BranchOverviewContent(
    overview: BranchOverview,
    modifier: Modifier = Modifier,
    refreshError: AppError? = null,
    actions: (@Composable () -> Unit)? = null,
) {
    ScreenColumn(modifier) {
        if (refreshError != null) item(key = "refresh-error") { RefreshErrorBanner(refreshError) }
        if (actions != null) item(key = "actions") { actions() }
        item(key = "info") { BranchInfoCard(overview.branch) }
        item(key = "timings") { BranchTimingsCard(overview.branch) }
        item(key = "settings") { BranchSettingsCard(overview.settings) }
    }
}

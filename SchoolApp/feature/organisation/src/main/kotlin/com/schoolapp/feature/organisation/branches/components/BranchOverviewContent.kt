package com.schoolapp.feature.organisation.branches.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
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
    bottomPadding: Dp = 16.dp,
) {
    ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottomPadding)) {
        if (refreshError != null) item(key = "refresh-error") { RefreshErrorBanner(refreshError) }
        if (actions != null) item(key = "actions") { actions() }
        item(key = "info") { BranchInfoCard(overview.branch) }
        item(key = "timings") { BranchTimingsCard(overview.branch) }
        item(key = "settings") { BranchSettingsCard(overview.settings) }
    }
}

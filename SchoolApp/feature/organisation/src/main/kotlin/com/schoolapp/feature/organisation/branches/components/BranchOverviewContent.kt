package com.schoolapp.feature.organisation.branches.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.model.organisation.BranchOverview

@Composable
internal fun BranchOverviewContent(overview: BranchOverview, modifier: Modifier = Modifier) {
    ScreenColumn(modifier) {
        item(key = "info") { BranchInfoCard(overview.branch) }
        item(key = "timings") { BranchTimingsCard(overview.branch) }
        item(key = "settings") { BranchSettingsCard(overview.settings) }
    }
}

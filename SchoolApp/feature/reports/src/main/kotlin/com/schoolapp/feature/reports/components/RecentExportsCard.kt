package com.schoolapp.feature.reports.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.reports.RecentExport
import com.schoolapp.feature.reports.R

/** Exports started on this device, newest first; hidden when there are none. */
@Composable
internal fun RecentExportsCard(
    exports: List<RecentExport>,
    retrying: Set<String>,
    actions: RecentExportActions,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        SectionHeader(
            title = stringResource(R.string.reports_recent_title),
            subtitle = stringResource(R.string.reports_recent_subtitle),
            action = {
                AppTextButton(stringResource(R.string.reports_recent_clear), onClick = onClear, contentColor = AppColors.TextSecondary)
            },
        )
        exports.forEachIndexed { index, export ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            RecentExportRow(export, retrying = export.jobId in retrying, actions = actions)
        }
    }
}

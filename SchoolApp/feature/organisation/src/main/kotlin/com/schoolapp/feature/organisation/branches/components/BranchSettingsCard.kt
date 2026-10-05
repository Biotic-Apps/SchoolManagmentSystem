package com.schoolapp.feature.organisation.branches.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.BranchSetting
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R

@Composable
internal fun BranchSettingsCard(settings: List<BranchSetting>, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.org_branch_settings),
            subtitle = stringResource(R.string.org_read_only_hint),
        )
        if (settings.isEmpty()) {
            Text(stringResource(R.string.org_settings_empty), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        settings.forEach { KeyValueRow(humanizeKey(it.key), it.value) }
    }
}

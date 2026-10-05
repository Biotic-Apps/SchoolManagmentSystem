package com.schoolapp.feature.dashboard.components

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
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.R

@Composable
internal fun WelcomeCard(state: DashboardUiState.Welcome, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.dashboard_welcome, state.userName))
        KeyValueRow(stringResource(R.string.dashboard_role), roleLabel(state.role, state.roleName))
        state.schoolName?.let { KeyValueRow(stringResource(R.string.dashboard_school), it) }
        state.branchName?.let { KeyValueRow(stringResource(R.string.dashboard_branch), it) }
        Text(
            text = stringResource(R.string.dashboard_welcome_hint),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
    }
}

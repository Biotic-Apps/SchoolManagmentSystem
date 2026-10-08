package com.schoolapp.feature.dashboard.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.greetingName

@Composable
internal fun SummaryHeader(userName: String, scopeName: String?, modifier: Modifier = Modifier) {
    SectionHeader(
        title = stringResource(R.string.dashboard_greeting, greetingName(userName)),
        subtitle = scopeName ?: stringResource(R.string.dashboard_all_schools),
        modifier = modifier,
    )
}

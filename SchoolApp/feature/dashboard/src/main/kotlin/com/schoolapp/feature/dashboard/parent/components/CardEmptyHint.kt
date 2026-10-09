package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors

/** In-card empty state: what is missing, then a line of guidance. */
@Composable
internal fun CardEmptyHint(title: String, hint: String, modifier: Modifier = Modifier) {
    Column(modifier.padding(vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        Text(hint, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
    }
}

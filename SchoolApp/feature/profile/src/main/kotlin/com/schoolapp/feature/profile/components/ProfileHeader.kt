package com.schoolapp.feature.profile.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
internal fun ProfileHeader(name: String, email: String, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Box(
                modifier = Modifier.size(56.dp).background(AppColors.Selected, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Text(initials(name), style = MaterialTheme.typography.titleLarge, color = AppColors.Primary)
            }
            Column {
                Text(name, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary)
                if (email.isNotBlank()) {
                    Text(email, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

private fun initials(name: String): String =
    name.split(' ').filter { it.isNotBlank() }.take(2).joinToString("") { it.first().uppercase() }.ifEmpty { "?" }

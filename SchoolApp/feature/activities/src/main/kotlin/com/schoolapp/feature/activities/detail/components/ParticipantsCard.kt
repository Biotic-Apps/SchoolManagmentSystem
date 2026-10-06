package com.schoolapp.feature.activities.detail.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.feature.activities.R

@Composable
internal fun ParticipantsCard(participants: List<ActivityParticipant>, modifier: Modifier = Modifier) {
    AppCard(modifier, contentPadding = 0.dp) {
        participants.forEachIndexed { index, participant ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp)) {
                Text(participant.studentName, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                val details = listOfNotNull(
                    participant.role?.takeIf { it.isNotBlank() },
                    participant.position?.let { stringResource(R.string.activities_position, it) },
                    participant.result?.takeIf { it.isNotBlank() },
                    participant.remarks?.takeIf { it.isNotBlank() },
                )
                if (details.isNotEmpty()) {
                    Text(details.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

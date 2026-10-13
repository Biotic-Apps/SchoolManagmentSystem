package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Inbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.motion.entrance
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun EmptyState(
    title: String,
    modifier: Modifier = Modifier,
    message: String? = null,
    icon: ImageVector = Icons.Outlined.Inbox,
    action: (@Composable () -> Unit)? = null,
    tone: StatusTone = StatusTone.Neutral,
) {
    Box(
        modifier = modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 32.dp).entrance(offset = 0.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.widthIn(max = 420.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            AppLottie(
                resId = R.raw.anim_empty,
                modifier = Modifier.size(120.dp),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.headlineSmall,
                color = AppColors.TextPrimary,
                textAlign = TextAlign.Center,
            )
            if (message != null) {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    textAlign = TextAlign.Center,
                )
            }
            if (action != null) {
                Spacer(Modifier.height(4.dp))
                action()
            }
        }
    }
}

@Preview
@Composable
private fun EmptyStatePreview() = PreviewContainer {
    EmptyState(title = "Timetable", message = "Coming in Phase 2")
}

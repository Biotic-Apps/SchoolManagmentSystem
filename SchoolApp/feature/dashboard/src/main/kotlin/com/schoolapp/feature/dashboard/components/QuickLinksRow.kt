package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.dashboard.R

/** Parent shortcuts: health card, pickup & early leave, request leave ([onRequestLeave] null hides it). */
@Composable
internal fun QuickLinksRow(
    onHealth: () -> Unit,
    onPickup: () -> Unit,
    onRequestLeave: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    Row(modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        QuickLink(stringResource(R.string.dashboard_link_health), Icons.Outlined.HealthAndSafety, onHealth, Modifier.weight(1f))
        QuickLink(stringResource(R.string.dashboard_link_pickup), Icons.Outlined.DirectionsCar, onPickup, Modifier.weight(1f))
        onRequestLeave?.let {
            QuickLink(stringResource(R.string.dashboard_link_leave), Icons.Outlined.EventBusy, it, Modifier.weight(1f))
        }
    }
}

@Composable
private fun QuickLink(label: String, icon: ImageVector, onClick: () -> Unit, modifier: Modifier) {
    AppCard(modifier.fillMaxHeight(), onClick = onClick, contentPadding = 12.dp) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Icon(icon, contentDescription = null, tint = AppColors.Primary, modifier = Modifier.size(24.dp))
            Text(
                label,
                style = MaterialTheme.typography.labelLarge,
                color = AppColors.TextPrimary,
                textAlign = TextAlign.Center,
            )
        }
    }
}

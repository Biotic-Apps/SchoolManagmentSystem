package com.schoolapp.feature.messages.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.material.icons.outlined.CardMembership
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.navigation.ActivitiesDestination
import com.schoolapp.core.navigation.CertificatesDestination
import com.schoolapp.core.navigation.HealthCardDestination
import com.schoolapp.core.navigation.NoticesDestination
import com.schoolapp.core.navigation.PickupDestination
import com.schoolapp.feature.messages.R

private class Shortcut(val label: Int, val icon: ImageVector, val destination: Any)

private val Shortcuts = listOf(
    Shortcut(R.string.messages_shortcut_notices, Icons.Outlined.Campaign, NoticesDestination),
    Shortcut(R.string.messages_shortcut_activities, Icons.Outlined.Event, ActivitiesDestination),
    Shortcut(R.string.messages_shortcut_pickup, Icons.Outlined.DirectionsCar, PickupDestination),
    Shortcut(R.string.messages_shortcut_health, Icons.Outlined.HealthAndSafety, HealthCardDestination()),
    Shortcut(R.string.messages_shortcut_certificates, Icons.Outlined.CardMembership, CertificatesDestination),
)

/** Parent-only quick links above the conversations; chips wrap instead of truncating. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ParentShortcuts(onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    FlowRow(modifier = modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Shortcuts.forEach { shortcut ->
            AssistChip(
                onClick = { onOpen(shortcut.destination) },
                label = { Text(stringResource(shortcut.label)) },
                leadingIcon = { Icon(shortcut.icon, contentDescription = null, tint = AppColors.Primary, modifier = Modifier.size(18.dp)) },
                border = BorderStroke(1.dp, AppColors.Border),
                colors = AssistChipDefaults.assistChipColors(containerColor = AppColors.Surface, labelColor = AppColors.TextPrimary),
            )
        }
    }
}

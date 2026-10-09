package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.Payments
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
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.action
import com.schoolapp.feature.dashboard.parent.ParentAction
import com.schoolapp.feature.dashboard.parent.ParentActionKind

/** Shortcut tiles (pay, message, leave, meeting, health, pickup): three per row on phones, all in one row when wide. */
@Composable
internal fun ParentQuickActions(
    actions: List<ParentAction>,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.dashboard_quick_actions))
        AdaptiveCells(count = actions.size, narrowColumns = 3, wideColumns = actions.size.coerceAtLeast(1)) { index, cellModifier ->
            val action = actions[index]
            val (label, icon) = action.kind.presentation()
            val onClick = action.link.action(onOpenMenu, onOpen, canOpenMenu)
            QuickActionTile(label, icon, onClick, cellModifier.fillMaxHeight())
        }
    }
}

@Composable
private fun QuickActionTile(label: String, icon: ImageVector, onClick: (() -> Unit)?, modifier: Modifier) {
    AppCard(modifier, onClick = onClick, contentPadding = 12.dp) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            IconTile(icon, StatusTone.Neutral)
            Text(label, style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun ParentActionKind.presentation(): Pair<String, ImageVector> = when (this) {
    ParentActionKind.PAY_FEES -> stringResource(R.string.dashboard_action_pay) to Icons.Outlined.Payments
    ParentActionKind.MESSAGE_TEACHER -> stringResource(R.string.dashboard_action_message) to Icons.AutoMirrored.Outlined.Chat
    ParentActionKind.APPLY_LEAVE -> stringResource(R.string.dashboard_action_leave) to Icons.Outlined.EventBusy
    ParentActionKind.BOOK_MEETING -> stringResource(R.string.dashboard_action_meeting) to Icons.Outlined.EventAvailable
    ParentActionKind.HEALTH -> stringResource(R.string.dashboard_link_health) to Icons.Outlined.HealthAndSafety
    ParentActionKind.PICKUP -> stringResource(R.string.dashboard_link_pickup) to Icons.Outlined.DirectionsCar
}

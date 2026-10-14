package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveType
import com.schoolapp.feature.attendance.components.icon
import com.schoolapp.feature.attendance.components.leaveTypeHint
import com.schoolapp.feature.attendance.components.leaveTypeLabel

/** Leave types as selectable cards with an icon and a hint; 2 columns on phones, up to 5 on wide windows. */
@Composable
internal fun LeaveTypeSelector(selected: LeaveType, onSelect: (LeaveType) -> Unit, enabled: Boolean, modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier.fillMaxWidth()) {
        val columns = (maxWidth / MIN_TILE_WIDTH).toInt().coerceIn(2, LeaveType.entries.size)
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            LeaveType.entries.chunked(columns).forEach { row ->
                Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    row.forEach { type ->
                        TypeTile(type, type == selected, { onSelect(type) }, enabled, Modifier.weight(1f).fillMaxHeight())
                    }
                    repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

@Composable
private fun TypeTile(type: LeaveType, selected: Boolean, onClick: () -> Unit, enabled: Boolean, modifier: Modifier) {
    AppCard(
        modifier = modifier.semantics {
            this.selected = selected
            role = Role.RadioButton
        },
        onClick = onClick,
        selected = selected,
        enabled = enabled,
        contentPadding = 12.dp,
        verticalSpacing = 6.dp,
        animateSize = false,
    ) {
        IconTile(type.icon(), StatusTone.Info, size = 36.dp)
        Text(
            leaveTypeLabel(type),
            style = MaterialTheme.typography.titleSmall,
            color = if (selected) AppColors.OnSelected else AppColors.TextPrimary,
        )
        Text(
            leaveTypeHint(type),
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

private val MIN_TILE_WIDTH = 150.dp

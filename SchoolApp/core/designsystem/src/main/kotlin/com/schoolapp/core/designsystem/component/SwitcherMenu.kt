package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.Borders

/** Pill button that opens a dropdown of [options]; shared by role and child switchers. */
@Composable
internal fun SwitcherMenu(
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    icon: ImageVector,
    actionLabel: String,
    modifier: Modifier = Modifier,
    labelMaxWidth: Dp = DefaultLabelMaxWidth,
) {
    var expanded by rememberSaveable { mutableStateOf(false) }
    val selected = options.firstOrNull { it.id == selectedId } ?: options.firstOrNull() ?: return
    val canSwitch = options.size > 1
    Box(modifier) {
        Surface(
            onClick = { expanded = true },
            enabled = canSwitch,
            shape = MaterialTheme.shapes.small,
            color = AppColors.Surface,
            border = BorderStroke(Borders.Thin, AppColors.Border),
            modifier = Modifier
                .heightIn(min = 40.dp)
                .semantics {
                    role = Role.DropdownList
                    stateDescription = selected.label
                },
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(icon, contentDescription = actionLabel, tint = AppColors.Primary, modifier = Modifier.size(18.dp))
                if (labelMaxWidth > 0.dp) {
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = selected.label,
                        style = MaterialTheme.typography.labelMedium,
                        color = AppColors.TextPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.widthIn(max = labelMaxWidth),
                    )
                }
                if (canSwitch) {
                    Icon(Icons.Outlined.ExpandMore, contentDescription = null, tint = AppColors.TextSecondary)
                }
            }
        }
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            containerColor = AppColors.Surface,
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = {
                        Column {
                            Text(option.label, style = MaterialTheme.typography.bodyLarge)
                            option.supporting?.let {
                                Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                            }
                        }
                    },
                    trailingIcon = if (option.id == selected.id) {
                        { Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.Primary) }
                    } else {
                        null
                    },
                    onClick = {
                        expanded = false
                        if (option.id != selected.id) onSelect(option.id)
                    },
                )
            }
        }
    }
}

/** Label width cap; pass 0.dp for an icon-only pill (compact top bars). */
val DefaultLabelMaxWidth: Dp = 180.dp

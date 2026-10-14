package com.schoolapp.feature.admin.roles.list

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AdminPanelSettings
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.roles.Role
import com.schoolapp.feature.admin.R

/** One role: name, key, counts and type; pencil = editable, eye = view only; the bin shows only for custom roles nobody holds. */
@Composable
internal fun RoleRow(role: Role, canEdit: Boolean, onOpen: () -> Unit, onDelete: (() -> Unit)?) {
    val supporting = listOf(
        role.key,
        pluralStringResource(R.plurals.roles_permission_count, role.permissions.size, role.permissions.size),
        pluralStringResource(R.plurals.roles_assigned_count, role.assignmentCount, role.assignmentCount),
    ).joinToString(" · ")
    ListItemRow(
        title = role.name,
        supporting = supporting,
        leadingIcon = if (role.isSystem) Icons.Outlined.AdminPanelSettings else Icons.Outlined.Tune,
        onClick = onOpen,
        trailing = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                StatusChip(
                    text = stringResource(if (role.isSystem) R.string.roles_type_system else R.string.roles_type_custom),
                    tone = if (role.isSystem) StatusTone.Info else StatusTone.Neutral,
                )
                Icon(
                    imageVector = if (canEdit) Icons.Outlined.Edit else Icons.Outlined.Visibility,
                    contentDescription = stringResource(if (canEdit) R.string.roles_action_edit else R.string.roles_action_view),
                    tint = AppColors.TextSecondary,
                )
                if (onDelete != null) {
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Outlined.DeleteOutline, stringResource(R.string.roles_delete_cd, role.name), tint = AppColors.Error)
                    }
                }
            }
        },
    )
}

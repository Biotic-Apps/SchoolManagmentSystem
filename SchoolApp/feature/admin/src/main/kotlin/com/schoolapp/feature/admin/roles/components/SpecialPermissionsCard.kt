package com.schoolapp.feature.admin.roles.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.roles.PermissionInfo
import com.schoolapp.feature.admin.R

/** Permissions outside the module x action grid (e.g. `audit.view`), one checkbox row each. */
@Composable
internal fun SpecialPermissionsCard(
    permissions: List<PermissionInfo>,
    selected: Set<String>,
    readOnly: Boolean,
    onToggle: (String, Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (permissions.isEmpty()) return
    AppCard(modifier.fillMaxWidth(), contentPadding = 12.dp) {
        Text(
            stringResource(R.string.roles_special_title),
            style = MaterialTheme.typography.titleSmall,
            color = AppColors.TextPrimary,
            modifier = Modifier.padding(bottom = 4.dp),
        )
        permissions.forEach { permission ->
            val on = permission.key in selected
            Row(
                Modifier
                    .fillMaxWidth()
                    .toggleable(value = on, enabled = !readOnly, role = Role.Checkbox) { onToggle(permission.key, it) }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Checkbox(checked = on, onCheckedChange = null, enabled = !readOnly, colors = roleCheckboxColors())
                Column(Modifier.weight(1f)) {
                    Text(permission.description.ifBlank { permission.key }, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                    Text(permission.key, style = MaterialTheme.typography.bodySmall, fontFamily = FontFamily.Monospace, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

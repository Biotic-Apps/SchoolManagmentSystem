package com.schoolapp.feature.profile.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.RoleSummary

@Composable
internal fun RolesCard(roles: List<RoleSummary>, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        SectionHeader(
            title = stringResource(R.string.profile_roles_title),
            modifier = Modifier.padding(horizontal = 16.dp),
        )
        roles.forEach { role ->
            ListItemRow(
                title = roleLabel(role.role, role.roleName),
                supporting = role.scope,
                leadingIcon = Icons.Outlined.Badge,
            )
        }
    }
}

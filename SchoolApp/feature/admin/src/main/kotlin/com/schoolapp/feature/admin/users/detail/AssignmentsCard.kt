package com.schoolapp.feature.admin.users.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.users.UserAssignment
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.users.components.roleKeyLabel
import com.schoolapp.feature.admin.users.components.scopeLabel

/** "Roles": active assignments with their scope; assign / end when the viewer may manage this account. */
@Composable
internal fun AssignmentsCard(
    assignments: List<UserAssignment>,
    canManage: Boolean,
    onAssign: () -> Unit,
    onEnd: (UserAssignment) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        SectionHeader(
            title = stringResource(R.string.users_roles_title),
            action = if (canManage) {
                { AppTextButton(stringResource(R.string.users_assign_role), onAssign, leadingIcon = Icons.Outlined.Add) }
            } else {
                null
            },
        )
        AppCard(Modifier.fillMaxWidth(), contentPadding = 12.dp) {
            if (assignments.isEmpty()) {
                Text(stringResource(R.string.users_no_roles), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            }
            assignments.forEachIndexed { index, assignment ->
                if (index > 0) HorizontalDivider(color = AppColors.Border)
                AssignmentLine(assignment, onEnd.takeIf { canManage })
            }
        }
    }
}

@Composable
private fun AssignmentLine(assignment: UserAssignment, onEnd: ((UserAssignment) -> Unit)?) {
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                assignment.roleName ?: roleKeyLabel(assignment.roleKey),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
            )
            Text(scopeLabel(assignment), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            formatDate(assignment.validUntil)?.let { StatusChip(stringResource(R.string.users_until, it), StatusTone.Warning) }
        }
        onEnd?.let { AppTextButton(stringResource(R.string.users_end), onClick = { it(assignment) }) }
    }
}


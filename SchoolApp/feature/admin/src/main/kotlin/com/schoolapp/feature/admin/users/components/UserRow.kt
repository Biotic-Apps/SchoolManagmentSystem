package com.schoolapp.feature.admin.users.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.users.AdminUser
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.admin.R

/** One account: name, sign-in id, roles, branches, status / locked and last sign-in. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun UserRow(user: AdminUser, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onClick, verticalSpacing = 8.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(user.name, null)
            Column(Modifier.weight(1f)) {
                Text(user.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    user.email ?: user.phone ?: stringResource(R.string.users_dash),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            StatusChip(userStatusLabel(user.status), userStatusTone(user.status))
            if (user.isLocked()) StatusChip(stringResource(R.string.users_locked), StatusTone.Error)
            user.roles.forEach { StatusChip(roleKeyLabel(it), StatusTone.Info) }
        }
        val details = listOfNotNull(
            user.branchNames.takeIf { it.isNotEmpty() }?.joinToString(", "),
            stringResource(R.string.users_last_sign_in, formatTimestamp(user.lastLoginAt) ?: stringResource(R.string.users_never)),
        )
        Text(details.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
    }
}

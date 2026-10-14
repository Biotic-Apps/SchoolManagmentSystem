package com.schoolapp.feature.admin.users.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.LockOpen
import androidx.compose.material.icons.outlined.PersonOff
import androidx.compose.material.icons.outlined.HowToReg
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R

/** Edit, reset password, unlock and disable / enable (web user-columns.tsx row actions). */
@Composable
internal fun UserActionsCard(state: UserDetailUiState, actions: UserDetailActions, modifier: Modifier = Modifier) {
    val user = state.detail?.user ?: return
    if (!state.canEdit) return
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        PrimaryButton(
            text = stringResource(R.string.users_edit),
            onClick = actions.onEdit,
            leadingIcon = Icons.Outlined.Edit,
            modifier = Modifier.fillMaxWidth(),
        )
        if (!state.canManage) return@Column
        SecondaryButton(
            text = stringResource(R.string.users_reset_password),
            onClick = { actions.onAsk(UserConfirm.ResetPassword) },
            enabled = !state.isWorking,
            leadingIcon = Icons.Outlined.Key,
            modifier = Modifier.fillMaxWidth(),
        )
        if (state.canUnlock) {
            SecondaryButton(
                text = stringResource(R.string.users_unlock),
                onClick = { actions.onAsk(UserConfirm.Unlock) },
                enabled = !state.isWorking,
                leadingIcon = Icons.Outlined.LockOpen,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        SecondaryButton(
            text = stringResource(if (user.isActive) R.string.users_disable else R.string.users_enable),
            onClick = { actions.onAsk(UserConfirm.ToggleStatus) },
            enabled = !state.isWorking,
            loading = state.isWorking,
            leadingIcon = if (user.isActive) Icons.Outlined.PersonOff else Icons.Outlined.HowToReg,
            contentColor = if (user.isActive) AppColors.Error else AppColors.Primary,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

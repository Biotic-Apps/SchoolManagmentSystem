package com.schoolapp.feature.admin.users.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.users.AdminUserDetail
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.users.components.isLocked
import com.schoolapp.feature.admin.users.components.userStatusLabel
import com.schoolapp.feature.admin.users.components.userStatusTone

internal data class UserDetailActions(
    val onEdit: () -> Unit,
    val onAssignRole: () -> Unit,
    val onAsk: (UserConfirm) -> Unit,
    val onRefresh: () -> Unit,
)

@Composable
internal fun UserDetailContent(state: UserDetailUiState, actions: UserDetailActions, modifier: Modifier = Modifier) {
    val detail = state.detail ?: return
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn(maxWidth = AdminFormMaxWidth) {
            item(key = "chips") { UserChips(detail) }
            item(key = "info") { UserInfoCard(detail) }
            state.actionError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
            item(key = "roles") {
                AssignmentsCard(
                    assignments = state.activeAssignments,
                    canManage = state.canManage,
                    onAssign = actions.onAssignRole,
                    onEnd = { actions.onAsk(UserConfirm.EndAssignment(it)) },
                )
            }
            item(key = "actions") { UserActionsCard(state, actions) }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun UserChips(detail: AdminUserDetail) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        StatusChip(userStatusLabel(detail.user.status), userStatusTone(detail.user.status))
        if (detail.mustChangePassword) StatusChip(stringResource(R.string.users_must_change_password), StatusTone.Warning)
        if (detail.user.isLocked()) StatusChip(stringResource(R.string.users_locked), StatusTone.Error)
    }
}

@Composable
private fun UserInfoCard(detail: AdminUserDetail) {
    val dash = stringResource(R.string.users_dash)
    AppCard(Modifier.fillMaxWidth()) {
        KeyValueRow(stringResource(R.string.users_field_email), detail.user.email ?: dash)
        KeyValueRow(stringResource(R.string.users_field_phone), detail.user.phone ?: dash)
        KeyValueRow(stringResource(R.string.users_field_last_sign_in), formatTimestamp(detail.user.lastLoginAt) ?: stringResource(R.string.users_never))
        KeyValueRow(stringResource(R.string.users_field_created), formatDate(detail.createdAt) ?: dash)
    }
}

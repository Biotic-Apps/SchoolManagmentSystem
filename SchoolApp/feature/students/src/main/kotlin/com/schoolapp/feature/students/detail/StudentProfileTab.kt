package com.schoolapp.feature.students.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Shuffle
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.manage.ManageController
import com.schoolapp.feature.students.manage.ManageNotice
import com.schoolapp.feature.students.manage.PlacementKind
import com.schoolapp.feature.students.profile.studentProfileItems

/** Profile tab: header, placement actions, guardians, current enrollment and personal details. */
@Composable
internal fun StudentProfileTab(
    detail: StudentDetail,
    state: StudentDetailUiState,
    manage: ManageController?,
    onNoticeShown: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val actions = rememberExternalActions()
    ScreenColumn(modifier) {
        studentProfileItems(
            detail = detail,
            actions = actions,
            afterHeader = {
                if (manage != null && (state.canAct || state.notice != null)) {
                    item(key = "actions") { ActionsRow(state, manage, onNoticeShown) }
                }
            },
            onEditGuardian = manage?.let { m -> m::openEditGuardian }?.takeIf { state.canEditGuardians },
            onAddGuardian = manage?.let { m -> m::openAddGuardian }?.takeIf { state.canLinkGuardian },
            showDocuments = false,
        )
    }
}

@Composable
private fun ActionsRow(state: StudentDetailUiState, manage: ManageController, onNoticeShown: () -> Unit) {
    state.notice?.let { notice ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            InlineMessage(stringResource(noticeText(notice)), StatusTone.Success, Modifier.weight(1f))
            IconButton(onClick = onNoticeShown) { Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.students_dismiss)) }
        }
    }
    if (!state.canAct) return
    FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SecondaryButton(stringResource(R.string.students_edit), onClick = manage::openEdit, leadingIcon = Icons.Outlined.Edit)
        SecondaryButton(stringResource(R.string.students_change_section), onClick = { manage.openPlacement(PlacementKind.CHANGE_SECTION) }, leadingIcon = Icons.Outlined.Shuffle)
        SecondaryButton(stringResource(R.string.students_transfer), onClick = { manage.openPlacement(PlacementKind.TRANSFER) }, leadingIcon = Icons.Outlined.SwapHoriz)
        AppTextButton(
            stringResource(R.string.students_withdraw),
            onClick = { manage.openPlacement(PlacementKind.WITHDRAW) },
            leadingIcon = Icons.AutoMirrored.Outlined.Logout,
            contentColor = AppColors.Error,
        )
    }
}

private fun noticeText(notice: ManageNotice): Int = when (notice) {
    ManageNotice.SAVED -> R.string.students_notice_saved
    ManageNotice.WITHDRAWN -> R.string.students_notice_withdrawn
    ManageNotice.SECTION_CHANGED -> R.string.students_notice_section
    ManageNotice.TRANSFER_REQUESTED -> R.string.students_notice_transfer
    ManageNotice.GUARDIAN_LINKED -> R.string.students_notice_guardian
}

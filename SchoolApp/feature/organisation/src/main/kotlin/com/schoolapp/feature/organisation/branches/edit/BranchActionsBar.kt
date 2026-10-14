package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Archive
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.ManageAccounts
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Unarchive
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.ActionErrorMessage
import com.schoolapp.feature.organisation.components.SuccessNotice

/** Actions the role may take on [branch] (same set as the web row menu), plus the last save's notice. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun BranchActionsBar(
    branch: Branch,
    state: BranchEditorState,
    editor: BranchEditor,
    modifier: Modifier = Modifier,
    showAdd: Boolean = false,
) {
    val perms = state.perms
    val archiving = branch.status == "ACTIVE"
    val canToggle = if (archiving) perms.canArchive else perms.canActivate
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SuccessNotice(state.notice, editor::dismissNotice)
        ActionErrorMessage(state.openError)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (showAdd && perms.canAdd) {
                PrimaryButton(stringResource(R.string.org_add_branch), onClick = editor::openAdd, leadingIcon = Icons.Outlined.Add)
            }
            if (perms.canEdit) {
                SecondaryButton(stringResource(R.string.org_edit), onClick = { editor.openEdit(branch) }, leadingIcon = Icons.Outlined.Edit)
            }
            if (perms.canEditTimings) {
                SecondaryButton(stringResource(R.string.org_edit_timings), onClick = { editor.openEdit(branch) }, leadingIcon = Icons.Outlined.Schedule)
            }
            if (perms.canEditSettings) {
                SecondaryButton(stringResource(R.string.org_settings), onClick = { editor.tools.openSettings(branch) }, leadingIcon = Icons.Outlined.Settings)
            }
            if (perms.canChangePrincipal) {
                SecondaryButton(
                    stringResource(R.string.org_change_principal),
                    onClick = { editor.tools.openPrincipal(branch) },
                    leadingIcon = Icons.Outlined.ManageAccounts,
                )
            }
            if (canToggle) {
                SecondaryButton(
                    text = stringResource(if (archiving) R.string.org_archive else R.string.org_activate),
                    onClick = { editor.askStatus(branch) },
                    leadingIcon = if (archiving) Icons.Outlined.Archive else Icons.Outlined.Unarchive,
                    contentColor = if (archiving) AppColors.Error else AppColors.Primary,
                )
            }
        }
    }
}

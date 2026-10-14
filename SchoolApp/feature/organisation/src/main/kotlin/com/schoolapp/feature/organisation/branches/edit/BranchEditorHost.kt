package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.organisation.R

/** Renders whichever branch sheet or confirmation is open. */
@Composable
internal fun BranchEditorHost(state: BranchEditorState, editor: BranchEditor) {
    state.form?.let { BranchFormSheet(it, editor) }
    state.settings?.let { BranchSettingsSheet(it, editor.tools) }
    state.principal?.let { ChangePrincipalSheet(it, editor.tools) }
    state.status?.let { change ->
        val name = change.branch.name
        ConfirmDialog(
            title = stringResource(if (change.archiving) R.string.org_archive_branch_title else R.string.org_activate_branch_title, name),
            message = change.error?.let { actionErrorMessage(it.error, it.details) }
                ?: stringResource(if (change.archiving) R.string.org_archive_branch_message else R.string.org_activate_branch_message),
            confirmLabel = stringResource(if (change.archiving) R.string.org_archive else R.string.org_activate),
            onConfirm = { if (!change.saving) editor.confirmStatus() },
            onDismiss = editor::dismissStatus,
            destructive = change.archiving,
        )
    }
}

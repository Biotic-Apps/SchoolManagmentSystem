package com.schoolapp.feature.staff.detail

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.feature.staff.account.StaffAccountCard
import com.schoolapp.feature.staff.account.StaffAccountUiState
import com.schoolapp.feature.staff.account.showsCardFor

/** Actions the profile tab may offer; null = not allowed for this viewer. */
internal class ProfileActions(
    val onEdit: (() -> Unit)?,
    val onStatus: (() -> Unit)?,
    val onProbation: (() -> Unit)?,
    val onAssign: (() -> Unit)?,
    val onCreateAccount: () -> Unit,
    val onResetPassword: () -> Unit,
) {
    val any: Boolean get() = onEdit != null || onStatus != null || onProbation != null || onAssign != null
}

@Composable
internal fun StaffProfileTab(
    state: StaffDetailUiState,
    account: StaffAccountUiState,
    actions: ProfileActions,
    modifier: Modifier = Modifier,
) {
    val detail = state.detail ?: return
    val s = detail.summary
    ScreenColumn(modifier) {
        item(key = "profile") { StaffProfileCard(detail) }
        if (actions.any) {
            item(key = "actions") {
                StaffActionsRow(onEdit = actions.onEdit, onStatus = actions.onStatus, onProbation = actions.onProbation, onAssign = actions.onAssign)
            }
        }
        if (account.showsCardFor(detail)) {
            item(key = "account") {
                StaffAccountCard(
                    detail = detail,
                    state = account,
                    isSelf = state.isSelf,
                    onCreate = actions.onCreateAccount,
                    onReset = actions.onResetPassword,
                )
            }
        }
        item(key = "probation") { ProbationCard(s.requiresReview, s.reviewerName, onChange = actions.onProbation) }
        state.workload?.let { w -> item(key = "workload") { WorkloadCard(w) } }
    }
}

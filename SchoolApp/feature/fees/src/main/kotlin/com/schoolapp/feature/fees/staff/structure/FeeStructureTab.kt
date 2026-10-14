package com.schoolapp.feature.fees.staff.structure

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R

/** "Fee structure": fee heads, fee plans per class for a session, and sibling discounts. */
@Composable
internal fun FeeStructureTab(
    branch: FinanceBranch,
    session: SessionContext,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: FeeStructureViewModel = hiltViewModel(key = "fees_structure_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch) }
    // Plans change on the plan form screen; reload when coming back.
    var resumed by remember { mutableStateOf(false) }
    LifecycleResumeEffect(viewModel) {
        if (resumed) viewModel.reloadPlans()
        resumed = true
        onPauseOrDispose { }
    }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val canAdd = session.has("fees.add")
    val rights = PlanRights(canEdit = session.has("fees.edit"), canApprove = session.has("fees.approve"))
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.sessions.isEmpty() && state.heads.isEmpty() ->
            ErrorState(appErrorMessage(state.error!!), modifier, onRetry = viewModel::retry)
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
            ScreenColumn(itemSpacing = 12.dp) {
                if (branch.schoolId == null) item(key = "no_school") { InlineMessage(stringResource(R.string.fees_st_no_school), StatusTone.Warning) }
                state.notice?.let { item(key = "notice") { InlineMessage(noticeText(it), StatusTone.Success) } }
                state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "heads") { FeeHeadsCard(state.heads, canAdd && branch.schoolId != null, viewModel::openHeadForm) }
                item(key = "plans_header") { SectionHeader(stringResource(R.string.fees_st_plans), subtitle = stringResource(R.string.fees_st_plans_help)) }
                if (state.sessions.isEmpty()) {
                    item(key = "no_sessions") { InlineMessage(stringResource(R.string.fees_st_no_sessions), StatusTone.Info) }
                } else {
                    item(key = "sessions") {
                        FilterChipRow(state.sessions.map { SwitcherOption(it.id, it.name) }, state.sessionId, viewModel::onSession)
                    }
                    val sessionId = state.sessionId
                    if (canAdd && sessionId != null) {
                        item(key = "new_plan") {
                            SecondaryButton(
                                stringResource(R.string.fees_st_new_plan),
                                { onOpen(FeePlanFormDestination(branch.id, branch.schoolId, sessionId, null)) },
                                leadingIcon = Icons.Outlined.Add,
                            )
                        }
                    }
                    val plans = state.plans
                    when {
                        state.plansLoading && plans == null -> item(key = "plans_loading") { LoadingState(rows = 2) }
                        state.plansError != null && plans == null ->
                            item(key = "plans_error") { ErrorState(appErrorMessage(state.plansError!!), onRetry = viewModel::reloadPlans) }
                        plans.isNullOrEmpty() -> item(key = "plans_empty") { Muted(stringResource(R.string.fees_st_plans_empty)) }
                        else -> items(plans, key = { "plan_${it.id}" }) { plan ->
                            FeePlanCard(
                                plan = plan,
                                rights = rights,
                                busy = state.busy,
                                onEdit = { onOpen(FeePlanFormDestination(branch.id, branch.schoolId, sessionId.orEmpty(), plan.id)) },
                                onApprove = { viewModel.ask(StructureConfirm.Approve(plan)) },
                                onArchive = { viewModel.ask(StructureConfirm.Archive(plan)) },
                            )
                        }
                    }
                }
                item(key = "siblings") {
                    SiblingDiscountsCard(
                        discounts = state.discounts,
                        canAdd = canAdd && branch.schoolId != null,
                        canEdit = rights.canEdit,
                        onAdd = { viewModel.openSiblingForm() },
                        onEdit = { viewModel.openSiblingForm(it) },
                        onDelete = { viewModel.ask(StructureConfirm.DeleteSibling(it)) },
                    )
                }
            }
        }
    }
    state.headForm?.let { HeadFormSheet(it, viewModel::editHead, viewModel::saveHead, viewModel::dismissHeadForm) }
    state.siblingForm?.let { SiblingFormSheet(it, viewModel::editSibling, viewModel::saveSibling, viewModel::dismissSiblingForm) }
    state.confirm?.let { StructureConfirmDialog(it, viewModel::confirm, viewModel::dismissConfirm) }
}

@Composable
private fun StructureConfirmDialog(confirm: StructureConfirm, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    when (confirm) {
        is StructureConfirm.Approve -> ConfirmDialog(
            title = stringResource(R.string.fees_st_approve_title),
            message = stringResource(R.string.fees_st_approve_message, confirm.plan.name, confirm.plan.className),
            confirmLabel = stringResource(R.string.fees_st_approve),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
        )
        is StructureConfirm.Archive -> ConfirmDialog(
            title = stringResource(R.string.fees_st_archive_title),
            message = stringResource(R.string.fees_st_archive_message, confirm.plan.name),
            confirmLabel = stringResource(R.string.fees_st_archive),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            destructive = true,
        )
        is StructureConfirm.DeleteSibling -> ConfirmDialog(
            title = stringResource(R.string.fees_st_delete_sibling_title),
            message = stringResource(R.string.fees_st_delete_sibling_message, confirm.discount.childIndex),
            confirmLabel = stringResource(R.string.fees_st_delete),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            destructive = true,
        )
    }
}

@Composable
private fun noticeText(notice: StructureNotice): String = stringResource(
    when (notice) {
        StructureNotice.HEAD_ADDED -> R.string.fees_st_head_added
        StructureNotice.PLAN_APPROVED -> R.string.fees_st_plan_approved
        StructureNotice.PLAN_ARCHIVED -> R.string.fees_st_plan_archived
        StructureNotice.SIBLING_ADDED -> R.string.fees_st_sibling_added
        StructureNotice.SIBLING_UPDATED -> R.string.fees_st_sibling_updated
        StructureNotice.SIBLING_REMOVED -> R.string.fees_st_sibling_removed
    },
)

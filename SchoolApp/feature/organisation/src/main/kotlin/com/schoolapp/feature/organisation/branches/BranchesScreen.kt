package com.schoolapp.feature.organisation.branches

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.branches.components.BranchOverviewContent
import com.schoolapp.feature.organisation.branches.edit.BranchActionsBar
import com.schoolapp.feature.organisation.branches.edit.BranchEditor
import com.schoolapp.feature.organisation.branches.edit.BranchEditorState
import com.schoolapp.feature.organisation.components.ActionErrorMessage
import com.schoolapp.feature.organisation.components.RefreshErrorBanner
import com.schoolapp.feature.organisation.components.SuccessNotice
import com.schoolapp.feature.organisation.components.recordStatusTone

@Composable
fun BranchesScreen(
    state: BranchesUiState,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onOpenBranch: (String) -> Unit,
    modifier: Modifier = Modifier,
    calendarContent: @Composable () -> Unit = {},
    editorState: BranchEditorState = BranchEditorState(),
    editor: BranchEditor? = null,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.overview != null -> SingleBranchContent(state, onRefresh, calendarContent, editorState, editor, modifier)
        else -> RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
            BranchList(state, onRetry, onOpenBranch, editorState, editor)
        }
    }
}

@Composable
private fun BranchList(
    state: BranchesUiState,
    onRetry: () -> Unit,
    onOpenBranch: (String) -> Unit,
    editorState: BranchEditorState,
    editor: BranchEditor?,
) {
    val canAdd = editor != null && editorState.perms.canAdd
    Box(Modifier.fillMaxSize()) {
        ScreenColumn(
            contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (canAdd) FAB_CLEARANCE else 16.dp),
            itemSpacing = 0.dp,
        ) {
            val showToolbar = editorState.notice != null || editorState.openError != null
            if (editor != null && showToolbar) item(key = "toolbar") { ListToolbar(editorState, editor) }
            if (state.error != null && !state.hasContent) {
                item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                return@ScreenColumn
            }
            if (state.error != null) item(key = "refresh-error") { RefreshErrorBanner(state.error, Modifier.padding(bottom = 16.dp)) }
            dataListItems(
                items = state.branches,
                key = { it.id },
                emptyContent = { EmptyState(title = stringResource(R.string.org_branches_empty), icon = Icons.Outlined.Apartment) },
            ) { branch ->
                ListItemRow(
                    title = branch.name,
                    supporting = listOfNotNull(branch.schoolName, branch.code, branch.principalName).joinToString(" · "),
                    leadingIcon = Icons.Outlined.Apartment,
                    onClick = { onOpenBranch(branch.id) },
                    trailing = { branch.status?.let { StatusChip(humanizeKey(it), recordStatusTone(it)) } },
                )
            }
        }
        if (canAdd && editor != null) AddBranchFab(editor, Modifier.align(Alignment.BottomEnd))
    }
}

/** "Add branch" (super admin) floating bottom-right above the bottom bar. */
@Composable
private fun AddBranchFab(editor: BranchEditor, modifier: Modifier = Modifier) {
    AppFloatingButton(
        text = stringResource(R.string.org_add_branch),
        icon = Icons.Outlined.Add,
        onClick = editor::openAdd,
        modifier = modifier.padding(16.dp),
    )
}

/** Notice of the last save above the list. */
@Composable
private fun ListToolbar(state: BranchEditorState, editor: BranchEditor) {
    Column(Modifier.fillMaxWidth().padding(bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SuccessNotice(state.notice, editor::dismissNotice)
        ActionErrorMessage(state.openError)
    }
}

/** One branch (principal): its details plus sessions and calendar, matching the "Branch & Calendar" menu entry. */
@Composable
private fun SingleBranchContent(
    state: BranchesUiState,
    onRefresh: () -> Unit,
    calendarContent: @Composable () -> Unit,
    editorState: BranchEditorState,
    editor: BranchEditor?,
    modifier: Modifier = Modifier,
) {
    val overview = state.overview ?: return
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier) {
        AppTabs(
            titles = listOf(stringResource(R.string.org_tab_branch), stringResource(R.string.org_tab_calendar)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        if (tab == 0) {
            val canAdd = editor != null && editorState.perms.canAdd
            Box(Modifier.fillMaxSize()) {
                RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxSize()) {
                    BranchOverviewContent(
                        overview,
                        refreshError = state.error,
                        actions = editor?.let { { BranchActionsBar(overview.branch, editorState, it) } },
                        bottomPadding = if (canAdd) FAB_CLEARANCE else 16.dp,
                    )
                }
                if (canAdd && editor != null) AddBranchFab(editor, Modifier.align(Alignment.BottomEnd))
            }
        } else {
            calendarContent()
        }
    }
}

/** Room under the last item so the floating "Add branch" never covers it. */
private val FAB_CLEARANCE = 88.dp

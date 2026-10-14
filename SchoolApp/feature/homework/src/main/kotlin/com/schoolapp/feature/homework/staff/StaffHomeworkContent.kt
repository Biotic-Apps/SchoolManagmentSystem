package com.schoolapp.feature.homework.staff

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AssignmentTurnedIn
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.components.HomeworkCard
import com.schoolapp.feature.homework.components.SectionChips

internal class StaffHomeworkActions(
    val onBranchSelected: (String) -> Unit,
    val onSectionSelected: (String) -> Unit,
    val onAssign: () -> Unit,
    val onOpenHomework: (Homework) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
)

@Composable
internal fun StaffHomeworkContent(state: StaffHomeworkUiState, actions: StaffHomeworkActions, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.scopeError != null -> ErrorState(appErrorMessage(state.scopeError), modifier, onRetry = actions.onRetry)
        else -> Box(modifier.fillMaxSize()) {
            val showAssign = state.canAssign && state.sectionId != null && state.sections.isNotEmpty()
            RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh, modifier = Modifier.fillMaxSize()) {
                ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (showAssign) 88.dp else 16.dp)) {
                    if (state.branches.isNotEmpty()) {
                        item(key = "branch") {
                            ScopePicker(
                                options = state.branches.map { SwitcherOption(it.id, it.name) },
                                selectedId = state.branchId,
                                onSelect = actions.onBranchSelected,
                            )
                        }
                    }
                    if (state.sections.isEmpty()) {
                        item(key = "no_sections") {
                            EmptyState(
                                stringResource(R.string.homework_no_sections),
                                message = stringResource(R.string.homework_no_sections_message),
                                icon = Icons.Outlined.Groups,
                            )
                        }
                    } else {
                        item(key = "sections") { SectionChips(state.sections, state.sectionId, actions.onSectionSelected) }
                        homeworkList(state, actions)
                    }
                }
            }
            if (showAssign) {
                AppFloatingButton(
                    text = stringResource(R.string.homework_assign),
                    icon = Icons.Outlined.Add,
                    onClick = actions.onAssign,
                    modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
                )
            }
        }
    }
}

private fun LazyListScope.homeworkList(state: StaffHomeworkUiState, actions: StaffHomeworkActions) {
    when {
        state.isListLoading -> item(key = "loading") { LoadingState(rows = 3) }
        state.listError != null -> item(key = "error") {
            ErrorState(appErrorMessage(state.listError), onRetry = actions.onRefresh)
        }
        state.homework.isEmpty() -> item(key = "empty") {
            EmptyState(
                stringResource(R.string.homework_empty),
                message = stringResource(
                    if (state.canAssign) R.string.homework_empty_staff_message else R.string.homework_empty_staff_readonly,
                ),
                icon = Icons.Outlined.AssignmentTurnedIn,
            )
        }
        else -> items(state.homework, key = { it.id }) { homework ->
            HomeworkCard(homework, onSelect = { actions.onOpenHomework(homework) })
        }
    }
}

package com.schoolapp.feature.homework.staff

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AssignmentTurnedIn
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
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
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh, modifier = modifier) {
            ScreenColumn {
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
                    if (state.canAssign && state.sectionId != null) {
                        item(key = "assign") {
                            PrimaryButton(
                                text = stringResource(R.string.homework_assign),
                                onClick = actions.onAssign,
                                leadingIcon = Icons.Outlined.Add,
                                modifier = Modifier.fillMaxWidth(),
                            )
                        }
                    }
                    homeworkList(state, actions)
                }
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

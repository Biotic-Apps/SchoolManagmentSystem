package com.schoolapp.feature.students.list

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material.icons.outlined.PersonSearch
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.StudentRow
import com.schoolapp.feature.students.paging.LoadMoreOnScroll
import com.schoolapp.feature.students.paging.Paged
import com.schoolapp.feature.students.paging.pagedItems
import com.schoolapp.feature.students.sections.StudentSearchBar

/** Callbacks of the Students tab. */
internal class StudentsTabActions(
    val onQueryChange: (String) -> Unit,
    val onClass: (String?) -> Unit,
    val onSection: (String?) -> Unit,
    val onStatus: (String?) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
    val onLoadMore: () -> Unit,
    val onOpenStudent: (String) -> Unit,
    val onAddStudent: () -> Unit,
    val onPrintSlips: () -> Unit,
    val onPrintCards: () -> Unit,
)

@Composable
internal fun StudentsTabContent(state: StudentsListUiState, paged: Paged<StudentSummary>, actions: StudentsTabActions) {
    val listState = rememberLazyListState()
    LoadMoreOnScroll(listState, actions.onLoadMore)
    Box(Modifier.fillMaxSize()) {
        RefreshBox(paged.isRefreshing, actions.onRefresh, Modifier.fillMaxSize()) {
            ScreenColumn(
                contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (state.canAdd) 88.dp else 16.dp),
                itemSpacing = 0.dp,
                state = listState,
            ) {
                if (state.canPrintCards || state.canPrintSlips) {
                    item(key = "actions") {
                        Row(Modifier.fillMaxWidth().padding(bottom = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            if (state.canPrintCards) {
                                SecondaryButton(
                                    stringResource(R.string.students_print_id_cards), actions.onPrintCards,
                                    Modifier.weight(1f), leadingIcon = Icons.Outlined.Badge,
                                )
                            }
                            if (state.canPrintSlips) {
                                SecondaryButton(
                                    stringResource(R.string.students_login_slips), actions.onPrintSlips,
                                    Modifier.weight(1f), leadingIcon = Icons.Outlined.Key,
                                )
                            }
                        }
                    }
                }
                item(key = "search") {
                    StudentSearchBar(state.query, actions.onQueryChange, Modifier.padding(bottom = 12.dp))
                }
                item(key = "filters") { StudentFilters(state, actions, Modifier.padding(bottom = 16.dp)) }
                if (state.scopeError != null) {
                    item(key = "scope_error") { ErrorState(appErrorMessage(state.scopeError), onRetry = actions.onRetry) }
                } else {
                    pagedItems(
                        paged = paged,
                        key = { it.id },
                        onRetry = actions.onRetry,
                        onLoadMore = actions.onLoadMore,
                        empty = {
                            EmptyState(
                                stringResource(R.string.students_list_empty),
                                message = stringResource(R.string.students_list_empty_hint),
                                icon = Icons.Outlined.PersonSearch,
                            )
                        },
                    ) { StudentRow(it, onClick = { actions.onOpenStudent(it.id) }, showClass = true) }
                }
            }
        }
        if (state.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.students_add_title),
                icon = Icons.Outlined.PersonAdd,
                onClick = actions.onAddStudent,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}

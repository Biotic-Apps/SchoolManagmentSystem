package com.schoolapp.feature.admissions.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.admissions.R

@Composable
internal fun ApplicationsTab(
    state: AdmissionsUiState,
    onFilter: (ApplicationStatus?) -> Unit,
    onQuery: (String) -> Unit,
    onOpenApplication: (String) -> Unit,
    onNewApplication: () -> Unit,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh, modifier = Modifier.fillMaxSize()) {
            ScreenColumn(
                contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (state.canAdd) 88.dp else 16.dp),
                itemSpacing = 0.dp,
            ) {
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    state.error != null && state.applications.isEmpty() ->
                        item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                    else -> {
                        state.error?.let { item(key = "staleError") { InlineMessage(appErrorMessage(it), StatusTone.Error, Modifier.padding(bottom = 8.dp)) } }
                        item(key = "search") {
                            SearchField(state.query, onQuery, Modifier.fillMaxWidth(), placeholder = stringResource(R.string.admissions_search_applications))
                        }
                        item(key = "filters") {
                            val all = SwitcherOption(ALL, stringResource(R.string.admissions_all, state.applications.size))
                            val options = listOf(all) + state.counts.map { (status, count) ->
                                SwitcherOption(status.name, stringResource(R.string.admissions_status_count, humanizeKey(status.name), count))
                            }
                            FilterChipRow(
                                options = options,
                                selectedId = state.filter?.name ?: ALL,
                                onSelect = { id -> onFilter(if (id == ALL) null else ApplicationStatus.valueOf(id)) },
                                modifier = Modifier.padding(vertical = 8.dp),
                            )
                        }
                        dataListItems(
                            items = state.visible,
                            key = { it.id },
                            emptyContent = { EmptyState(stringResource(R.string.admissions_empty), icon = Icons.AutoMirrored.Outlined.Assignment) },
                        ) { app ->
                            ListItemRow(
                                title = app.childName,
                                supporting = listOfNotNull(app.className, app.applicationNo, formatDate(app.createdAt)).joinToString(" · "),
                                leadingIcon = Icons.AutoMirrored.Outlined.Assignment,
                                onClick = { onOpenApplication(app.id) },
                                trailing = { StatusChip(humanizeKey(app.status.name), statusTone(app.status.name)) },
                            )
                        }
                    }
                }
            }
        }
        if (state.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.admissions_new_title),
                icon = Icons.Outlined.Add,
                onClick = onNewApplication,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}

private const val ALL = "ALL"

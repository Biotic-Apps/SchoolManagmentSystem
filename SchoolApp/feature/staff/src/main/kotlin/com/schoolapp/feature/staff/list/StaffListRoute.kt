package com.schoolapp.feature.staff.list

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.staff.R

@Composable
fun StaffListRoute(
    onOpenStaff: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    StaffListScreen(state, viewModel::onQueryChange, onOpenStaff, viewModel::retry, modifier)
}

@Composable
fun StaffListScreen(
    state: StaffListUiState,
    onQueryChange: (String) -> Unit,
    onOpenStaff: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        SearchField(state.query, onQueryChange, Modifier.padding(16.dp), placeholder = stringResource(R.string.staff_search_hint))
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
            else -> DataList(
                items = state.staff,
                key = { it.id },
                modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 16.dp),
                emptyContent = { EmptyState(stringResource(R.string.staff_empty), icon = Icons.Outlined.Badge) },
            ) { member ->
                ListItemRow(
                    title = member.name,
                    supporting = listOfNotNull(
                        member.designation,
                        stringResource(R.string.staff_counts, member.sectionCount, member.subjectCount),
                    ).joinToString(" · "),
                    leading = { PersonAvatar(member.name, member.photoUrl) },
                    onClick = { onOpenStaff(member.id) },
                    trailing = when {
                        member.requiresReview -> { { StatusChip(stringResource(R.string.staff_on_probation), StatusTone.Warning) } }
                        member.status != null && member.status != "ACTIVE" -> {
                            { StatusChip(humanizeKey(member.status.orEmpty()), statusTone(member.status)) }
                        }
                        else -> null
                    },
                )
            }
        }
    }
}

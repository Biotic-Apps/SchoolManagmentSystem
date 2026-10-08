package com.schoolapp.feature.organisation.catalogue

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.MeetingRoom
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R

/** "Subjects & rooms": master lists for adding and renaming; usually they are created inline in Class setup. */
@Composable
internal fun CatalogueTab(
    branchId: String,
    schoolId: String?,
    modifier: Modifier = Modifier,
    header: @Composable () -> Unit = {},
    viewModel: CatalogueViewModel = hiltViewModel(),
) {
    LaunchedEffect(branchId, schoolId) { viewModel.bind(branchId, schoolId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    CatalogueList(state, viewModel, header, modifier)
    state.editor?.let { CatalogueEditorSheet(it, viewModel) }
}

@Composable
private fun CatalogueList(state: CatalogueUiState, viewModel: CatalogueViewModel, header: @Composable () -> Unit, modifier: Modifier) {
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 16.dp)) {
        item(key = "header") { Box(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) { header() } }
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null && state.subjects.isEmpty() && state.rooms.isEmpty() ->
                item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = viewModel::load) }
            else -> catalogueItems(state, viewModel)
        }
    }
}

private fun LazyListScope.catalogueItems(state: CatalogueUiState, viewModel: CatalogueViewModel) {
    item(key = "hint") {
        Text(
            stringResource(R.string.org_catalogue_hint),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
        )
    }
    item(key = "subjects-header") { Header(R.string.org_subjects_title, state.canAddSubject) { viewModel.openNew(CatalogueKind.SUBJECT) } }
    if (state.subjects.isEmpty()) item(key = "subjects-empty") { Empty(R.string.org_subjects_empty) }
    items(state.subjects, key = { "s" + it.id }) { subject ->
        ListItemRow(
            title = subject.name,
            supporting = subject.code,
            leadingIcon = Icons.AutoMirrored.Outlined.MenuBook,
            onClick = { viewModel.openEdit(CatalogueKind.SUBJECT, subject.id) }.takeIf { state.canRename },
        )
    }
    item(key = "rooms-header") { Header(R.string.org_rooms_title, state.canAddRoom) { viewModel.openNew(CatalogueKind.ROOM) } }
    if (state.rooms.isEmpty()) item(key = "rooms-empty") { Empty(R.string.org_rooms_empty) }
    items(state.rooms, key = { "r" + it.id }) { room ->
        ListItemRow(
            title = room.name,
            supporting = room.capacity?.let { pluralStringResource(R.plurals.org_room_seats, it, it) },
            leadingIcon = Icons.Outlined.MeetingRoom,
            onClick = { viewModel.openEdit(CatalogueKind.ROOM, room.id) }.takeIf { state.canRename },
        )
    }
}

@Composable
private fun Header(titleRes: Int, canAdd: Boolean, onAdd: () -> Unit) {
    SectionHeader(
        title = stringResource(titleRes),
        modifier = Modifier.padding(horizontal = 16.dp).padding(top = 16.dp),
        action = if (canAdd) {
            { AppTextButton(stringResource(R.string.org_add), onClick = onAdd, leadingIcon = Icons.Outlined.Add) }
        } else {
            null
        },
    )
}

@Composable
private fun Empty(textRes: Int) {
    Text(
        stringResource(textRes),
        style = MaterialTheme.typography.bodyMedium,
        color = AppColors.TextSecondary,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
    )
}

package com.schoolapp.feature.students.roster

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.CenteredColumn
import com.schoolapp.feature.students.components.StudentRow

@Composable
fun SectionRosterRoute(
    onBack: () -> Unit,
    onOpenStudent: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SectionRosterViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SectionRosterScreen(state, onBack, onOpenStudent, viewModel::load, modifier)
}

@Composable
fun SectionRosterScreen(
    state: SectionRosterUiState,
    onBack: () -> Unit,
    onOpenStudent: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title,
                subtitle = if (state.isLoading) null else pluralStringResource(R.plurals.students_count, state.students.size, state.students.size),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        CenteredColumn(Modifier.padding(padding)) {
            when {
                state.isLoading -> LoadingState()
                state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
                else -> DataList(
                    items = state.students,
                    key = { it.id },
                    modifier = Modifier.padding(16.dp),
                    emptyContent = { EmptyState(stringResource(R.string.students_roster_empty), icon = Icons.Outlined.Groups) },
                ) { StudentRow(it, onClick = { onOpenStudent(it.id) }) }
            }
        }
    }
}

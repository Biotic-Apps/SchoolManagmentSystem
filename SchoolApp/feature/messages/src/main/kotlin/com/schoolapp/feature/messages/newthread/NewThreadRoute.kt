package com.schoolapp.feature.messages.newthread

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.messages.R

@Composable
fun NewThreadRoute(
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NewThreadViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.createdThreadId) {
        state.createdThreadId?.let {
            viewModel.onNavigated()
            onCreated(it)
        }
    }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.messages_new_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        NewThreadScreen(
            state = state,
            actions = NewThreadActions(
                onChildSelected = viewModel::onChildSelected,
                onQueryChange = viewModel::onQueryChange,
                onStudentSelected = viewModel::onStudentSelected,
                onClearStudent = viewModel::onClearStudent,
                onSubjectChange = viewModel::onSubjectChange,
                onBodyChange = viewModel::onBodyChange,
                onSubmit = viewModel::submit,
            ),
            modifier = Modifier.padding(padding),
        )
    }
}

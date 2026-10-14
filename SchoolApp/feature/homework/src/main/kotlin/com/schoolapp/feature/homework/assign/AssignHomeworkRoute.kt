package com.schoolapp.feature.homework.assign

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
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.homework.R

@Composable
internal fun AssignHomeworkRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AssignHomeworkViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.done) {
        if (state.done) onBack()
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.homework_assign),
                subtitle = state.sectionLabel.ifBlank { null },
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        val loadError = state.loadError
        when {
            state.isLoading -> LoadingState(contentModifier)
            loadError != null -> ErrorState(appErrorMessage(loadError), contentModifier, onRetry = viewModel::load)
            else -> AssignHomeworkForm(
                state = state,
                actions = AssignHomeworkActions(
                    onSubject = viewModel::onSubject,
                    onTitle = viewModel::onTitle,
                    onDescription = viewModel::onDescription,
                    onDueDate = viewModel::onDueDate,
                    onMaxMarks = viewModel::onMaxMarks,
                    onAttach = viewModel::onAttach,
                    onRemoveAttachment = viewModel::onRemoveAttachment,
                    onSubmit = viewModel::submit,
                ),
                modifier = contentModifier,
            )
        }
    }
}

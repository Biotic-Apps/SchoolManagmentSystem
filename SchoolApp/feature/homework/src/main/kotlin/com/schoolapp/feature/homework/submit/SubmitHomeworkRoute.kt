package com.schoolapp.feature.homework.submit

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SearchOff
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
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.homework.R

@Composable
internal fun SubmitHomeworkRoute(onBack: () -> Unit, modifier: Modifier = Modifier, viewModel: SubmitHomeworkViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.done) {
        if (state.done) onBack()
    }
    val homework = state.homework
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = homework?.title ?: stringResource(R.string.homework_parent_title),
                subtitle = homework?.let { subtitle(it) },
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        val loadError = state.loadError
        when {
            state.isLoading -> LoadingState(contentModifier)
            loadError != null -> ErrorState(appErrorMessage(loadError), contentModifier, onRetry = viewModel::load)
            homework == null -> EmptyState(stringResource(R.string.homework_not_found), contentModifier, icon = Icons.Outlined.SearchOff)
            else -> SubmitHomeworkContent(
                state = state,
                homework = homework,
                actions = SubmitHomeworkActions(
                    onText = viewModel::onText,
                    onAttach = viewModel::onAttach,
                    onRemoveAttachment = viewModel::onRemoveAttachment,
                    onSubmit = viewModel::submit,
                ),
                modifier = contentModifier,
            )
        }
    }
}

@Composable
private fun subtitle(homework: Homework): String {
    val parts = listOfNotNull(
        homework.subjectName.ifBlank { null },
        stringResource(R.string.homework_due_on, formatDate(homework.dueDate).orEmpty()),
        homework.maxMarks?.let { stringResource(R.string.homework_max_marks, it) },
    )
    return parts.joinToString(" · ")
}

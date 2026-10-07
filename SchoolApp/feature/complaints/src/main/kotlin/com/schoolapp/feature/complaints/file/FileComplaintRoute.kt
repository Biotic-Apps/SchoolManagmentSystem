package com.schoolapp.feature.complaints.file

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
import com.schoolapp.feature.complaints.R

@Composable
fun FileComplaintRoute(
    onBack: () -> Unit,
    onFiled: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: FileComplaintViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.filedId) {
        state.filedId?.let {
            viewModel.onNavigated()
            onFiled(it)
        }
    }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.complaints_new_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        FileComplaintScreen(
            state = state,
            actions = FileComplaintActions(
                onCategorySelected = viewModel::onCategorySelected,
                onChildSelected = viewModel::onChildSelected,
                onSubjectChange = viewModel::onSubjectChange,
                onDescriptionChange = viewModel::onDescriptionChange,
                onAnonymousChange = viewModel::onAnonymousChange,
                onAttach = viewModel::onAttach,
                onRemoveAttachment = viewModel::onRemoveAttachment,
                onSubmit = viewModel::submit,
            ),
            modifier = Modifier.padding(padding),
        )
    }
}

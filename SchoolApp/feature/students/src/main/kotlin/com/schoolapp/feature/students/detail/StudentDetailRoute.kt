package com.schoolapp.feature.students.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
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
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.profile.studentProfileItems

@Composable
fun StudentDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StudentDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    StudentDetailScreen(state, onBack, viewModel::load, modifier)
}

@Composable
fun StudentDetailScreen(
    state: StudentDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val actions = rememberExternalActions()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.detail?.summary?.name ?: stringResource(R.string.students_detail_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.error != null -> ErrorState(appErrorMessage(state.error), body, onRetry = onRetry)
            state.detail != null -> ScreenColumn(body) { studentProfileItems(state.detail, actions) }
        }
    }
}

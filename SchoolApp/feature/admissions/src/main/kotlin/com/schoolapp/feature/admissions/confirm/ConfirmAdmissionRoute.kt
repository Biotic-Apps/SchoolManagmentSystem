package com.schoolapp.feature.admissions.confirm

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.MeetingRoom
import androidx.compose.runtime.Composable
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
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admissions.R

/** Confirm an offered application; after success shows the admission no. and parent sign-in details once. */
@Composable
fun ConfirmAdmissionRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onDone: () -> Unit = onBack,
    viewModel: ConfirmAdmissionViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val done = state.confirmed
    BackHandler(enabled = state.submitting) { }
    BackHandler(enabled = done != null, onBack = onDone)
    AppScaffold(
        modifier = modifier,
        topBar = {
            val title = if (done != null) R.string.admissions_enrolled_title else R.string.admissions_confirm_admission
            AppTopBar(
                title = stringResource(title),
                subtitle = state.childName.ifBlank { null },
                navigationIcon = { if (!state.submitting) BackButton(if (done != null) onDone else onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            done != null -> AdmissionDoneContent(state.childName, done, onDone = onDone, modifier = body)
            state.isLoading -> LoadingState(body)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            state.noSections -> EmptyState(
                title = stringResource(R.string.admissions_no_sections, state.className.orEmpty()),
                modifier = body,
                icon = Icons.Outlined.MeetingRoom,
            )
            else -> ConfirmFormContent(state, viewModel, body)
        }
    }
}

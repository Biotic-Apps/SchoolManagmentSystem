package com.schoolapp.feature.admin.users.assignments

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AssignmentInd
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth

@Composable
internal fun AddAssignmentRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AddAssignmentViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.saved) { if (state.saved) onBack() }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(title = stringResource(R.string.users_assign_title, state.userName), navigationIcon = { BackButton(onBack) })
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> ScreenColumn(body, maxWidth = AdminFormMaxWidth) {
                item(key = "fields") {
                    AppCard(Modifier.fillMaxWidth()) {
                        AssignmentFields(
                            draft = state.draft,
                            options = state.options,
                            problems = state.problems,
                            onChange = viewModel::onDraftChange,
                            tomorrow = tomorrow(),
                        )
                    }
                }
                state.saveError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
                item(key = "save") {
                    PrimaryButton(
                        text = stringResource(R.string.users_assign_role),
                        onClick = viewModel::save,
                        loading = state.isSaving,
                        enabled = !state.isSaving,
                        leadingIcon = Icons.Outlined.AssignmentInd,
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                    )
                }
            }
        }
    }
}

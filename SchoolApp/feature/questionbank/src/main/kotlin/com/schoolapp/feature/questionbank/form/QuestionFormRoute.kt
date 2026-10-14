package com.schoolapp.feature.questionbank.form

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
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.questionbank.R

/** Add / edit question screen; closes itself after a successful save (the list shows the snackbar). */
@Composable
internal fun QuestionFormRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: QuestionFormViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.saved) { if (state.saved) onBack() }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(if (state.isEdit) R.string.qb_edit_question else R.string.qb_add_question),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val inner = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(inner)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), inner, onRetry = viewModel::load)
            else -> ScreenColumn(inner) {
                state.saveError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
                item(key = "classification") { ClassificationFields(state, viewModel) }
                item(key = "content") { ContentFields(state, viewModel) }
                item(key = "save") {
                    PrimaryButton(
                        text = stringResource(if (state.isEdit) R.string.qb_save_changes else R.string.qb_add_question),
                        onClick = viewModel::save,
                        loading = state.isSaving,
                    )
                }
            }
        }
    }
}

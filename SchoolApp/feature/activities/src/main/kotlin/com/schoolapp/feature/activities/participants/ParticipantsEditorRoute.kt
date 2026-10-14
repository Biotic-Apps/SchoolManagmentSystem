package com.schoolapp.feature.activities.participants

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.participants.components.AddParticipantSection
import com.schoolapp.feature.activities.participants.components.ParticipantRowCard

/** Participants, results and positions of one activity (`PUT /activities/{id}/participants`). */
@Composable
internal fun ParticipantsEditorRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ParticipantsEditorViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.activities_participants_title),
                subtitle = state.title.takeIf { it.isNotBlank() },
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.error != null -> ErrorState(appErrorMessage(state.error!!), body, onRetry = viewModel::load)
            else -> ParticipantsEditorContent(state, viewModel, body)
        }
    }
    state.confirmRemove?.let { row ->
        ConfirmDialog(
            title = stringResource(R.string.activities_participant_remove_title),
            message = stringResource(R.string.activities_participant_remove_message, row.name),
            confirmLabel = stringResource(R.string.activities_participant_remove),
            onConfirm = viewModel::confirmRemove,
            onDismiss = viewModel::dismissRemove,
            destructive = true,
        )
    }
}

@Composable
private fun ParticipantsEditorContent(state: ParticipantsEditorUiState, viewModel: ParticipantsEditorViewModel, modifier: Modifier) {
    val enabled = !state.isSaving
    ScreenColumn(modifier) {
        if (state.saved && !state.dirty) {
            item(key = "saved") { InlineMessage(stringResource(R.string.activities_participants_saved), StatusTone.Success) }
        }
        state.saveError?.let { item(key = "saveError") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        item(key = "add") { AddParticipantSection(state, enabled, viewModel::onSearch, viewModel::add) }
        item(key = "header") {
            val count = pluralStringResource(R.plurals.activities_participants_count, state.rows.size, state.rows.size)
            val subtitle = state.maxParticipants?.let { stringResource(R.string.activities_participants_limit, count, it) } ?: count
            SectionHeader(stringResource(R.string.activities_participants_title), subtitle = subtitle)
        }
        if (state.overLimit) {
            item(key = "limit") {
                InlineMessage(stringResource(R.string.activities_participants_over_limit, state.maxParticipants ?: 0), StatusTone.Error)
            }
        }
        if (state.rows.isEmpty()) {
            item(key = "empty") { EmptyState(stringResource(R.string.activities_participants_empty), icon = Icons.Outlined.Groups) }
        }
        items(state.rows.size, key = { state.rows[it].studentId }) { index ->
            val row = state.rows[index]
            ParticipantRowCard(row, enabled, viewModel::onRowChange, onRemove = { viewModel.askRemove(row) })
        }
        item(key = "save") {
            PrimaryButton(
                stringResource(R.string.activities_participants_save),
                viewModel::save,
                Modifier.fillMaxWidth(),
                enabled = state.dirty && !state.overLimit,
                loading = state.isSaving,
            )
        }
    }
}

package com.schoolapp.feature.progress.notes

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.NoteAdd
import androidx.compose.material.icons.automirrored.outlined.StickyNote2
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.components.NoteCard
import com.schoolapp.feature.progress.components.rollName

@Composable
internal fun StudentNotesRoute(onBack: () -> Unit, viewModel: StudentNotesViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val studentLabel = rollName(state.rollNo, state.studentName)
    AppScaffold(
        topBar = {
            AppTopBar(
                title = stringResource(R.string.progress_notes_title),
                subtitle = studentLabel,
                navigationIcon = { BackButton(onBack) },
            )
        },
        floatingActionButton = {
            if (state.canAdd) {
                AppFloatingButton(stringResource(R.string.progress_add_note), Icons.AutoMirrored.Outlined.NoteAdd, viewModel::openForm)
            }
        },
    ) { padding ->
        StudentNotesScreen(state, onRetry = viewModel::retry, modifier = Modifier.padding(padding))
    }
    state.form?.let { form ->
        AddNoteSheet(
            form = form,
            studentLabel = studentLabel,
            onCategoryChange = viewModel::onCategoryChange,
            onNoteChange = viewModel::onNoteChange,
            onVisibleChange = viewModel::onVisibleChange,
            onSubmit = viewModel::submit,
            onDismiss = viewModel::dismissForm,
        )
    }
}

@Composable
internal fun StudentNotesScreen(state: StudentNotesUiState, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
            state.message?.let { message ->
                item(key = "message") {
                    when (message) {
                        NoteMessage.SAVED -> InlineMessage(stringResource(R.string.progress_note_saved), StatusTone.Success)
                        NoteMessage.PENDING_REVIEW -> InlineMessage(stringResource(R.string.progress_note_pending), StatusTone.Warning)
                    }
                }
            }
            if (state.notes.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.progress_no_notes),
                        message = stringResource(R.string.progress_no_notes_message),
                        icon = Icons.AutoMirrored.Outlined.StickyNote2,
                    )
                }
            }
            items(state.notes, key = { it.id }) { NoteCard(it) }
        }
    }
}

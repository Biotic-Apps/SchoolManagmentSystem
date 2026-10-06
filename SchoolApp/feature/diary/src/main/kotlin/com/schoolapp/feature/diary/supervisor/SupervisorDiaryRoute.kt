package com.schoolapp.feature.diary.supervisor

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.components.DateNavigator
import com.schoolapp.feature.diary.components.DiaryEntryCard

@Composable
internal fun SupervisorDiaryRoute(
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    viewModel: SupervisorDiaryViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    var pickSection by rememberSaveable { mutableStateOf(false) }
    ScreenColumn(modifier) {
        item(key = "date") { DateNavigator(state.date, state.today, viewModel::onPreviousDay, viewModel::onNextDay, viewModel::onDateSelected) }
        onOpenApprovals?.let { open -> item(key = "moderation") { ModerationCard(onClick = open) } }
        item(key = "missing_header") { SectionHeader(title = stringResource(R.string.diary_missing_title)) }
        item(key = "missing") {
            when {
                state.missingLoading -> LoadingState()
                state.missingError != null -> ErrorState(appErrorMessage(state.missingError!!), onRetry = viewModel::loadMissing)
                else -> MissingDiariesCard(state.missing)
            }
        }
        item(key = "browse_header") { SectionHeader(title = stringResource(R.string.diary_browse_title)) }
        item(key = "section_picker") {
            when {
                state.sectionsError != null -> ErrorState(appErrorMessage(state.sectionsError!!), onRetry = viewModel::reloadAll)
                state.sections.isEmpty() -> EmptyState(stringResource(R.string.diary_no_sections), icon = Icons.Outlined.Groups)
                else -> PickerField(
                    value = state.selectedSectionLabel.orEmpty(),
                    label = stringResource(R.string.diary_section),
                    onClick = { pickSection = true },
                    icon = Icons.Outlined.Groups,
                )
            }
        }
        if (state.returnedMessage) item(key = "returned") { InlineMessage(stringResource(R.string.diary_returned_done), StatusTone.Success) }
        browseItems(state, onOpenAttachment = external::open, onReturn = viewModel::onReturnClick, onRetry = viewModel::loadEntries)
    }
    if (pickSection) {
        SectionPickerSheet(
            sections = state.sections,
            selectedId = state.selectedSectionId,
            onSelect = {
                pickSection = false
                viewModel.onSectionSelected(it)
            },
            onDismiss = { pickSection = false },
        )
    }
    state.returnEditor?.let { editor ->
        ReturnEntrySheet(editor, viewModel::onReturnCommentChange, viewModel::submitReturn, viewModel::onDismissReturn)
    }
}

private fun androidx.compose.foundation.lazy.LazyListScope.browseItems(
    state: SupervisorDiaryUiState,
    onOpenAttachment: (String) -> Unit,
    onReturn: (String) -> Unit,
    onRetry: () -> Unit,
) {
    if (state.selectedSectionId == null) return
    when {
        state.entriesLoading -> item(key = "entries_loading") { LoadingState() }
        state.entriesError != null -> item(key = "entries_error") { ErrorState(appErrorMessage(state.entriesError), onRetry = onRetry) }
        state.entries.isEmpty() -> item(key = "entries_empty") { EmptyState(stringResource(R.string.diary_section_no_entries)) }
        else -> items(state.entries.size, key = { state.entries[it].id }) { index ->
            val entry = state.entries[index]
            val canReturn = state.canReturn && entry.status == DiaryStatus.SUBMITTED
            DiaryEntryCard(
                entry = entry,
                onOpenAttachment = onOpenAttachment,
                footer = if (canReturn) {
                    { AppTextButton(stringResource(R.string.diary_return_action), onClick = { onReturn(entry.id) }) }
                } else {
                    null
                },
            )
        }
    }
}

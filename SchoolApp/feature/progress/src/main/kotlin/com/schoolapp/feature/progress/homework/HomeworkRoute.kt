package com.schoolapp.feature.progress.homework

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.components.SectionPicker
import com.schoolapp.feature.progress.homework.components.HomeworkEntryCard
import com.schoolapp.feature.progress.homework.components.HomeworkMessageBanner
import com.schoolapp.feature.progress.homework.components.HomeworkRosterRow
import com.schoolapp.feature.progress.homework.components.HomeworkSaveBar

@Composable
internal fun HomeworkRoute(modifier: Modifier = Modifier, viewModel: HomeworkViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var pickingDate by rememberSaveable { mutableStateOf(false) }
    HomeworkScreen(
        state = state,
        actions = HomeworkActions(
            onSectionSelected = viewModel::onSectionSelected,
            onPickDate = { pickingDate = true },
            onEntrySelected = viewModel::onEntrySelected,
            onChangeEntry = viewModel::clearEntry,
            onTick = viewModel::onTick,
            onMarkAllDone = viewModel::markAllDone,
            onSave = viewModel::save,
            onRetry = viewModel::retry,
            onRetryEntries = viewModel::retryEntries,
            onRetryRoster = viewModel::retryRoster,
        ),
        modifier = modifier,
    )
    if (pickingDate) {
        AppDatePickerDialog(
            initialDate = state.date,
            maxDate = state.today,
            onConfirm = {
                pickingDate = false
                viewModel.onDateChange(it)
            },
            onDismiss = { pickingDate = false },
        )
    }
}

internal class HomeworkActions(
    val onSectionSelected: (String) -> Unit,
    val onPickDate: () -> Unit,
    val onEntrySelected: (DiaryEntry) -> Unit,
    val onChangeEntry: () -> Unit,
    val onTick: (String, HomeworkStatus) -> Unit,
    val onMarkAllDone: () -> Unit,
    val onSave: () -> Unit,
    val onRetry: () -> Unit,
    val onRetryEntries: () -> Unit,
    val onRetryRoster: () -> Unit,
)

@Composable
internal fun HomeworkScreen(state: HomeworkUiState, actions: HomeworkActions, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = actions.onRetry)
        state.sections.isEmpty() -> EmptyState(
            title = stringResource(R.string.progress_no_sections),
            message = stringResource(R.string.progress_no_sections_message),
            modifier = modifier,
            icon = Icons.Outlined.Groups,
        )
        else -> Column(modifier.fillMaxSize()) {
            ScreenColumn(Modifier.weight(1f)) {
                item(key = "sections") { SectionPicker(state.sections, state.selectedSectionId, actions.onSectionSelected) }
                item(key = "date") {
                    PickerField(
                        value = formatDate(state.date).orEmpty(),
                        label = stringResource(R.string.progress_date),
                        onClick = actions.onPickDate,
                        enabled = !state.isSaving,
                    )
                }
                val entry = state.selectedEntry
                if (entry == null) entryList(state, actions) else roster(state, entry, actions)
            }
            state.message?.let { HomeworkMessageBanner(it, Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) }
            if (state.selectedEntry != null && state.roster.isNotEmpty()) {
                HomeworkSaveBar(state.tickedCount, state.roster.size, state.isSaving, actions.onSave)
            }
        }
    }
}

private fun LazyListScope.entryList(state: HomeworkUiState, actions: HomeworkActions) {
    item(key = "entries_header") { SectionHeader(title = stringResource(R.string.progress_homework_entries)) }
    when {
        state.isLoadingEntries -> item(key = "entries_loading") { LoadingState() }
        state.entriesError != null -> item(key = "entries_error") {
            ErrorState(appErrorMessage(state.entriesError), onRetry = actions.onRetryEntries)
        }
        state.entries.isEmpty() -> item(key = "entries_empty") {
            EmptyState(
                title = stringResource(R.string.progress_no_homework),
                message = stringResource(R.string.progress_no_homework_message),
                icon = Icons.AutoMirrored.Outlined.MenuBook,
            )
        }
        else -> items(state.entries, key = { "entry_${it.id}" }) { entry ->
            HomeworkEntryCard(entry, onClick = { actions.onEntrySelected(entry) })
        }
    }
}

private fun LazyListScope.roster(state: HomeworkUiState, entry: DiaryEntry, actions: HomeworkActions) {
    item(key = "picked_entry") { HomeworkEntryCard(entry, onChange = actions.onChangeEntry.takeUnless { state.isSaving }) }
    item(key = "roster_header") {
        SectionHeader(
            title = stringResource(R.string.progress_students_header),
            action = if (state.roster.isNotEmpty()) {
                { AppTextButton(stringResource(R.string.progress_mark_all_done), actions.onMarkAllDone, enabled = !state.isSaving) }
            } else {
                null
            },
        )
    }
    when {
        state.isLoadingRoster -> item(key = "roster_loading") { LoadingState() }
        state.rosterError != null -> item(key = "roster_error") {
            ErrorState(appErrorMessage(state.rosterError), onRetry = actions.onRetryRoster)
        }
        state.roster.isEmpty() -> item(key = "roster_empty") {
            EmptyState(title = stringResource(R.string.progress_no_students), icon = Icons.Outlined.Groups)
        }
        else -> items(state.roster, key = { "student_${it.id}" }) { student ->
            HomeworkRosterRow(
                student = student,
                status = state.ticks[student.id],
                onSelect = { actions.onTick(student.id, it) },
                enabled = !state.isSaving,
            )
        }
    }
}

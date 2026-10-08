package com.schoolapp.feature.timetable.substitutions

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.timetable.R

/** Date field, the day's substitutions (pull to refresh) and, for editors, "Assign substitute" and remove. */
@Composable
internal fun SubstitutionsScreen(state: SubstitutionsUiState, viewModel: SubstitutionsViewModel, modifier: Modifier = Modifier) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    val dateText = formatDate(state.date).orEmpty()
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            PickerField(
                value = dateText,
                label = stringResource(R.string.timetable_subs_date),
                onClick = { pickDate = true },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp).widthIn(max = 480.dp),
            )
            state.actionError?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error, Modifier.padding(horizontal = 16.dp)) }
            state.notice?.let {
                val text = stringResource(if (it == SubstitutionNotice.ASSIGNED) R.string.timetable_subs_assigned else R.string.timetable_subs_removed)
                InlineMessage(text, StatusTone.Success, Modifier.padding(horizontal = 16.dp))
            }
            when {
                state.isLoading -> LoadingState(Modifier.weight(1f))
                state.error != null && state.items.isEmpty() ->
                    ErrorState(appErrorMessage(state.error), Modifier.weight(1f), onRetry = viewModel::retry)
                else -> RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxWidth().weight(1f)) {
                    ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 96.dp)) {
                        if (state.items.isEmpty()) {
                            item {
                                EmptyState(
                                    title = stringResource(R.string.timetable_subs_empty_title, dateText),
                                    message = stringResource(R.string.timetable_subs_empty_message),
                                    icon = Icons.Outlined.EventAvailable,
                                )
                            }
                        }
                        items(state.items, key = { it.id }) { item ->
                            SubstitutionCard(item, onRemove = if (state.canEdit) ({ viewModel.onRemoveRequested(item) }) else null)
                        }
                    }
                }
            }
        }
        if (state.canEdit && !state.isLoading) {
            AppFloatingButton(
                text = stringResource(R.string.timetable_subs_assign),
                icon = Icons.Outlined.Add,
                onClick = viewModel::openForm,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    SubstitutionsDialogs(state, viewModel)
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = state.date,
            onConfirm = {
                pickDate = false
                viewModel.onDateSelected(it)
            },
            onDismiss = { pickDate = false },
        )
    }
}

@Composable
private fun SubstitutionsDialogs(state: SubstitutionsUiState, viewModel: SubstitutionsViewModel) {
    state.form?.let { form ->
        SubstituteFormSheet(
            form = form,
            sections = state.sections,
            periods = state.periods,
            teachers = state.teachers,
            actions = SubstituteFormActions(
                onSection = viewModel::onFormSection,
                onDate = viewModel::onFormDate,
                onPeriod = viewModel::onFormPeriod,
                onTeacher = viewModel::onFormTeacher,
                onReason = viewModel::onFormReason,
                onSubmit = viewModel::submit,
                onDismiss = viewModel::dismissForm,
            ),
        )
    }
    if (state.removing != null) {
        ConfirmDialog(
            title = stringResource(R.string.timetable_subs_remove_title),
            message = stringResource(R.string.timetable_subs_remove_message),
            confirmLabel = stringResource(R.string.timetable_subs_remove),
            onConfirm = viewModel::confirmRemove,
            onDismiss = viewModel::onRemoveDismissed,
            destructive = true,
        )
    }
}

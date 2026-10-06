package com.schoolapp.feature.pickup.departure

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PersonOff
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
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.pickup.R
import com.schoolapp.feature.pickup.components.BorderedList
import com.schoolapp.feature.pickup.components.PickerOptionRow
import com.schoolapp.feature.pickup.components.PickupBlockedCard
import com.schoolapp.feature.pickup.components.departureTime

@Composable
internal fun RecordDepartureRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: RecordDepartureViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.pickup_record_title),
                subtitle = state.studentName,
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        RecordDepartureContent(
            state = state,
            onRetry = viewModel::load,
            onSelect = viewModel::onPickerSelected,
            onConfirm = viewModel::confirm,
            onChooseAnother = viewModel::chooseAnother,
            onDone = onBack,
            modifier = Modifier.padding(padding),
        )
    }
}

@Composable
internal fun RecordDepartureContent(
    state: RecordDepartureUiState,
    onRetry: () -> Unit,
    onSelect: (String) -> Unit,
    onConfirm: () -> Unit,
    onChooseAnother: () -> Unit,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val recorded = state.recorded
    val blocked = state.blocked
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            state.leaveTime?.let { time ->
                item(key = "leave") { InlineMessage(stringResource(R.string.pickup_early_leave_linked, formatTime(time).orEmpty()), StatusTone.Info) }
            }
            when {
                recorded != null -> {
                    item(key = "recorded") {
                        val picker = recorded.pickedUpByName ?: state.selectedPicker?.name.orEmpty()
                        InlineMessage(
                            stringResource(
                                R.string.pickup_recorded_message,
                                state.studentName ?: recorded.studentName.orEmpty(),
                                picker,
                                departureTime(recorded.at).orEmpty(),
                            ),
                            StatusTone.Success,
                        )
                    }
                    item(key = "done") { PrimaryButton(stringResource(R.string.pickup_done), onDone) }
                }
                blocked != null -> item(key = "blocked") { PickupBlockedCard(blocked.pickerName, onChooseAnother) }
                state.pickers.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.pickup_pickers_empty),
                        message = stringResource(R.string.pickup_pickers_empty_message),
                        icon = Icons.Outlined.PersonOff,
                    )
                }
                else -> pickerItems(state, onSelect, onConfirm)
            }
        }
    }
}

private fun LazyListScope.pickerItems(
    state: RecordDepartureUiState,
    onSelect: (String) -> Unit,
    onConfirm: () -> Unit,
) {
    item(key = "pick_header") { SectionHeader(stringResource(R.string.pickup_choose_picker)) }
    item(key = "pickers") {
        BorderedList(state.pickers) { picker ->
            PickerOptionRow(
                picker = picker,
                selected = picker.id == state.selectedPickerId,
                enabled = !state.isSaving,
                onSelect = { onSelect(picker.id) },
            )
        }
    }
    state.selectedPicker?.takeIf { !it.verified }?.let { picker ->
        item(key = "unverified") { InlineMessage(stringResource(R.string.pickup_unverified_warning, picker.name), StatusTone.Warning) }
    }
    state.saveError?.let { item(key = "save_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
    item(key = "confirm") {
        PrimaryButton(
            text = stringResource(R.string.pickup_confirm_departure),
            onClick = onConfirm,
            enabled = state.selectedPickerId != null,
            loading = state.isSaving,
        )
    }
}

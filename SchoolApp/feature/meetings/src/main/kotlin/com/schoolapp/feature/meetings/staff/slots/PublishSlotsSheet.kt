package com.schoolapp.feature.meetings.staff.slots

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.domain.SlotDraft
import com.schoolapp.feature.meetings.staff.slots.components.SlotDraftCard
import com.schoolapp.feature.meetings.staff.slots.components.SlotPickerField

/** Callbacks of the "Add slots" sheet. */
internal class PublishSlotsActions(
    val onUpdate: (Int, (SlotDraft) -> SlotDraft) -> Unit,
    val onAddRow: () -> Unit,
    val onRemoveRow: (Int) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

@Composable
internal fun PublishSlotsSheet(state: PublishSlotsSheetState, actions: PublishSlotsActions) {
    var pickerKey by rememberSaveable { mutableStateOf<Int?>(null) }
    var pickerField by rememberSaveable { mutableStateOf<SlotPickerField?>(null) }
    val enabled = !state.isSaving
    val drafts = state.form.drafts
    AppBottomSheet(title = stringResource(R.string.meetings_add_slots_title), onDismiss = actions.onDismiss) {
        Text(stringResource(R.string.meetings_add_slots_hint), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        state.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        drafts.forEachIndexed { index, draft ->
            SlotDraftCard(
                number = index + 1,
                draft = draft,
                problems = state.problems[draft.key].orEmpty(),
                enabled = enabled,
                removable = drafts.size > 1,
                onPick = { field ->
                    pickerKey = draft.key
                    pickerField = field
                },
                onModeChange = { mode: MeetingMode -> actions.onUpdate(draft.key) { it.copy(mode = mode) } },
                onLocationChange = { text -> actions.onUpdate(draft.key) { it.copy(location = text) } },
                onRemove = { actions.onRemoveRow(draft.key) },
            )
        }
        if (state.form.canAddRow) {
            AppTextButton(stringResource(R.string.meetings_add_another_slot), actions.onAddRow, enabled = enabled, leadingIcon = Icons.Outlined.Add)
        }
        PrimaryButton(pluralStringResource(R.plurals.meetings_publish_slots, drafts.size, drafts.size), actions.onSubmit, loading = state.isSaving)
    }
    val draft = drafts.firstOrNull { it.key == pickerKey }
    val field = pickerField
    if (draft != null && field != null) {
        val close = {
            pickerKey = null
            pickerField = null
        }
        SlotPickerDialog(draft, field, state.minDate, onDismiss = close) { value ->
            close()
            actions.onUpdate(draft.key) { field.apply(it, value) }
        }
    }
}

@Composable
private fun SlotPickerDialog(
    draft: SlotDraft,
    field: SlotPickerField,
    minDate: String,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit,
) {
    when (field) {
        SlotPickerField.DATE -> AppDatePickerDialog(initialDate = draft.date, onConfirm = onConfirm, onDismiss = onDismiss, minDate = minDate)
        SlotPickerField.START -> AppTimePickerDialog(
            initialTime = draft.startTime,
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            title = stringResource(R.string.meetings_slot_start_title),
        )
        SlotPickerField.END -> AppTimePickerDialog(
            initialTime = draft.endTime,
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            title = stringResource(R.string.meetings_slot_end_title),
        )
    }
}

private fun SlotPickerField.apply(draft: SlotDraft, value: String): SlotDraft = when (this) {
    SlotPickerField.DATE -> draft.copy(date = value)
    SlotPickerField.START -> draft.copy(startTime = value)
    SlotPickerField.END -> draft.copy(endTime = value)
}

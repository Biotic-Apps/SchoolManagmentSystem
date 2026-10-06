package com.schoolapp.feature.meetings.detail

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.LabeledSwitch
import com.schoolapp.feature.meetings.detail.components.FollowUpDraftRow
import com.schoolapp.feature.meetings.domain.CompleteErrors
import com.schoolapp.feature.meetings.domain.CompleteMeetingForm

/** Callbacks of the complete sheet. */
internal class CompleteSheetActions(
    val onNotes: (String) -> Unit,
    val onShareSummary: (Boolean) -> Unit,
    val onSummary: (String) -> Unit,
    val onAddFollowUp: () -> Unit,
    val onRemoveFollowUp: (Int) -> Unit,
    val onFollowUpTitle: (Int, String) -> Unit,
    val onFollowUpDate: (Int, String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

@Composable
internal fun CompleteMeetingSheet(
    form: CompleteMeetingForm,
    errors: CompleteErrors,
    busy: Boolean,
    error: AppError?,
    actions: CompleteSheetActions,
) {
    var pickDateFor by rememberSaveable { mutableStateOf<Int?>(null) }
    AppBottomSheet(title = stringResource(R.string.meetings_complete_title), onDismiss = actions.onDismiss) {
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(
            value = form.notes,
            onValueChange = actions.onNotes,
            label = stringResource(R.string.meetings_notes),
            errorText = stringResource(R.string.meetings_error_notes).takeIf { errors.notes },
            supportingText = stringResource(R.string.meetings_notes_hint),
            enabled = !busy,
        )
        LabeledSwitch(stringResource(R.string.meetings_share_summary), form.shareSummary, actions.onShareSummary, enabled = !busy)
        if (form.shareSummary) {
            AppTextArea(
                value = form.summary,
                onValueChange = actions.onSummary,
                label = stringResource(R.string.meetings_summary),
                errorText = stringResource(R.string.meetings_error_summary).takeIf { errors.summary },
                enabled = !busy,
            )
        }
        SectionHeader(stringResource(R.string.meetings_follow_ups), subtitle = stringResource(R.string.meetings_follow_ups_hint))
        form.followUps.forEach { draft ->
            FollowUpDraftRow(
                draft = draft,
                titleError = draft.key in errors.followUpTitles,
                dateError = draft.key in errors.followUpDates,
                enabled = !busy,
                onTitleChange = { actions.onFollowUpTitle(draft.key, it) },
                onPickDate = { pickDateFor = draft.key },
                onRemove = { actions.onRemoveFollowUp(draft.key) },
            )
        }
        AppTextButton(stringResource(R.string.meetings_add_follow_up), actions.onAddFollowUp, enabled = !busy, leadingIcon = Icons.Outlined.Add)
        PrimaryButton(stringResource(R.string.meetings_save_complete), actions.onSubmit, loading = busy)
    }
    pickDateFor?.let { key ->
        AppDatePickerDialog(
            initialDate = form.followUps.firstOrNull { it.key == key }?.dueDate,
            onConfirm = {
                pickDateFor = null
                actions.onFollowUpDate(key, it)
            },
            onDismiss = { pickDateFor = null },
        )
    }
}

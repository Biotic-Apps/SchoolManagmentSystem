package com.schoolapp.feature.organisation.sessions.events

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.ActionErrorMessage
import com.schoolapp.feature.organisation.components.DateInput

/** Add / edit a calendar entry; [onDelete] is set when editing. */
@Composable
internal fun EventFormSheet(form: EventForm, editor: EventEditor, onDelete: (() -> Unit)?) {
    @Composable
    fun message(field: EventField): String? = form.errors[field]?.let { stringResource(it) }

    AppBottomSheet(
        title = stringResource(if (form.isNew) R.string.org_add_event else R.string.org_edit_event),
        onDismiss = editor::dismissForm,
    ) {
        FilterChipRow(
            options = EventForm.TYPES.map { SwitcherOption(it, humanizeKey(it)) },
            selectedId = form.type,
            onSelect = { type -> editor.editForm(null) { it.copy(type = type) } },
        )
        if (form.isNew) {
            SegmentedChoice(
                labels = listOf(stringResource(R.string.org_scope_branch), stringResource(R.string.org_scope_school)),
                selectedIndex = if (form.wholeSchool) 1 else 0,
                onSelect = { index -> editor.editForm(null) { it.copy(wholeSchool = index == 1) } },
            )
        } else {
            InlineMessage(
                stringResource(if (form.wholeSchool) R.string.org_scope_school else R.string.org_scope_branch),
                StatusTone.Info,
            )
        }
        AppTextField(
            value = form.title,
            onValueChange = { v -> editor.editForm(EventField.TITLE) { it.copy(title = v.take(120)) } },
            label = stringResource(R.string.org_event_title),
            placeholder = stringResource(R.string.org_event_title_hint),
            errorText = message(EventField.TITLE),
            kind = FieldKind.Title,
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            DateInput(
                value = form.startDate,
                label = stringResource(R.string.org_start_date),
                onChange = { v -> editor.editForm(EventField.START) { it.copy(startDate = v, endDate = it.endDate.ifEmpty { v }) } },
                modifier = Modifier.weight(1f),
                errorText = message(EventField.START),
            )
            DateInput(
                value = form.endDate,
                label = stringResource(R.string.org_end_date),
                onChange = { v -> editor.editForm(EventField.END) { it.copy(endDate = v) } },
                modifier = Modifier.weight(1f),
                errorText = message(EventField.END),
                minDate = form.startDate.ifEmpty { null },
            )
        }
        AppTextArea(
            value = form.description,
            onValueChange = { v -> editor.editForm(null) { it.copy(description = v.take(1000)) } },
            label = stringResource(R.string.org_event_description),
        )
        ActionErrorMessage(form.error)
        PrimaryButton(
            text = stringResource(if (form.isNew) R.string.org_add_event else R.string.org_save_changes),
            onClick = editor::saveForm,
            loading = form.saving,
        )
        onDelete?.let {
            AppTextButton(
                text = stringResource(R.string.org_delete_event),
                onClick = it,
                leadingIcon = Icons.Outlined.DeleteOutline,
                contentColor = AppColors.Error,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

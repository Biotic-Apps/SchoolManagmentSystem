package com.schoolapp.feature.organisation.sessions.edit

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.ActionErrorMessage
import com.schoolapp.feature.organisation.components.DateInput

/** Name, start and end date; [minDate]/[maxDate] keep a term inside its session. */
@Composable
internal fun RangeFormFields(
    form: RangeForm,
    nameLabel: String,
    namePlaceholder: String,
    onEdit: (RangeField, (RangeForm) -> RangeForm) -> Unit,
    minDate: String? = null,
    maxDate: String? = null,
) {
    @Composable
    fun message(field: RangeField): String? = form.errors[field]?.let { stringResource(it) }

    AppTextField(
        value = form.name,
        onValueChange = { v -> onEdit(RangeField.NAME) { it.copy(name = v.take(40)) } },
        label = nameLabel,
        placeholder = namePlaceholder,
        errorText = message(RangeField.NAME),
        kind = FieldKind.Title,
        imeAction = ImeAction.Done,
    )
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        DateInput(
            value = form.startDate,
            label = stringResource(R.string.org_start_date),
            onChange = { v -> onEdit(RangeField.START) { it.copy(startDate = v) } },
            modifier = Modifier.weight(1f),
            errorText = message(RangeField.START),
            minDate = minDate,
            maxDate = maxDate,
        )
        DateInput(
            value = form.endDate,
            label = stringResource(R.string.org_end_date),
            onChange = { v -> onEdit(RangeField.END) { it.copy(endDate = v) } },
            modifier = Modifier.weight(1f),
            errorText = message(RangeField.END),
            minDate = form.startDate.ifEmpty { minDate },
            maxDate = maxDate,
        )
    }
    ActionErrorMessage(form.error)
}

/** New / edit academic session. */
@Composable
internal fun SessionFormSheet(form: RangeForm, editor: SessionEditor) {
    AppBottomSheet(
        title = stringResource(if (form.isNew) R.string.org_new_session else R.string.org_edit_session),
        onDismiss = editor::dismissForm,
    ) {
        RangeFormFields(
            form = form,
            nameLabel = stringResource(R.string.org_session_name),
            namePlaceholder = stringResource(R.string.org_session_name_hint),
            onEdit = editor::editForm,
        )
        if (form.isNew) {
            InlineMessage(stringResource(R.string.org_session_draft_hint), StatusTone.Info)
        }
        PrimaryButton(
            text = stringResource(if (form.isNew) R.string.org_create_session else R.string.org_save_changes),
            onClick = editor::saveForm,
            loading = form.saving,
        )
    }
}

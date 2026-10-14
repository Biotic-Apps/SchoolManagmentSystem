package com.schoolapp.feature.activities.propose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.labelRes
import com.schoolapp.feature.activities.propose.components.AudienceSection
import com.schoolapp.feature.activities.propose.components.LabeledSwitch

@Composable
internal fun ProposeFormContent(state: ProposeActivityUiState, actions: ProposeActions, modifier: Modifier) {
    var picker by rememberSaveable { mutableStateOf<ProposePicker?>(null) }
    val form = state.form
    val errors = state.errors
    val enabled = !state.isSubmitting
    ScreenColumn(modifier) {
        state.submitError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        item(key = "type") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(stringResource(R.string.activities_type))
                FilterChipRow(
                    options = ActivityType.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
                    selectedId = form.type.name,
                    onSelect = { if (enabled) actions.onType(ActivityType.valueOf(it)) },
                )
            }
        }
        item(key = "title") {
            AppTextField(
                value = form.title,
                onValueChange = actions.onTitle,
                label = stringResource(R.string.activities_field_title),
                errorText = stringResource(R.string.activities_error_title).takeIf { ProposeField.TITLE in errors },
                enabled = enabled,
            )
        }
        item(key = "description") {
            AppTextArea(
                value = form.description,
                onValueChange = actions.onDescription,
                label = stringResource(R.string.activities_field_description),
                errorText = stringResource(R.string.activities_error_description).takeIf { ProposeField.DESCRIPTION in errors },
                enabled = enabled,
            )
        }
        item(key = "date") {
            val dateError = when {
                ProposeField.DATE in errors -> stringResource(R.string.activities_error_date)
                ProposeField.DATE_PAST in errors -> stringResource(R.string.activities_error_date_past)
                else -> null
            }
            PickerField(formatDate(form.date).orEmpty(), stringResource(R.string.activities_field_date), { picker = ProposePicker.DATE }, errorText = dateError, enabled = enabled)
        }
        item(key = "start") {
            PickerField(
                value = formatTime(form.startTime).orEmpty(),
                label = stringResource(R.string.activities_field_start_time),
                onClick = { picker = ProposePicker.START },
                errorText = stringResource(R.string.activities_error_start_time).takeIf { ProposeField.START_TIME in errors },
                enabled = enabled,
                icon = Icons.Outlined.Schedule,
            )
        }
        item(key = "endDate") {
            PickerField(formatDate(form.effectiveEndDate).orEmpty(), stringResource(R.string.activities_field_end_date), { picker = ProposePicker.END_DATE }, enabled = enabled)
        }
        item(key = "end") {
            val endError = when {
                ProposeField.END_TIME in errors -> stringResource(R.string.activities_error_end_time)
                ProposeField.END_BEFORE_START in errors -> stringResource(R.string.activities_error_end_before_start)
                else -> null
            }
            PickerField(formatTime(form.endTime).orEmpty(), stringResource(R.string.activities_field_end_time), { picker = ProposePicker.END }, errorText = endError, enabled = enabled, icon = Icons.Outlined.Schedule)
        }
        item(key = "venue") { AppTextField(form.venue, actions.onVenue, stringResource(R.string.activities_field_venue), enabled = enabled) }
        item(key = "audience") { AudienceSection(state, actions, enabled) }
        item(key = "fee") {
            AppTextField(
                value = form.fee,
                onValueChange = actions.onFee,
                label = stringResource(R.string.activities_field_fee),
                errorText = stringResource(R.string.activities_error_fee).takeIf { ProposeField.FEE in errors },
                enabled = enabled,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            )
        }
        item(key = "max") {
            AppTextField(
                value = form.maxParticipants,
                onValueChange = actions.onMaxParticipants,
                label = stringResource(R.string.activities_field_max_participants),
                errorText = stringResource(R.string.activities_error_max_participants).takeIf { ProposeField.MAX_PARTICIPANTS in errors },
                enabled = enabled,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            )
        }
        item(key = "consent") {
            LabeledSwitch(stringResource(R.string.activities_field_consent_required), form.consentRequired, actions.onConsentRequired, enabled = enabled)
        }
        if (form.consentRequired) {
            item(key = "deadline") {
                val deadlineError = when {
                    ProposeField.DEADLINE in errors -> stringResource(R.string.activities_error_deadline)
                    ProposeField.DEADLINE_AFTER_START in errors -> stringResource(R.string.activities_error_deadline_after_start)
                    else -> null
                }
                PickerField(formatDate(form.consentDeadline).orEmpty(), stringResource(R.string.activities_field_deadline), { picker = ProposePicker.DEADLINE }, errorText = deadlineError, enabled = enabled)
            }
        }
        item(key = "submit") {
            val label = if (state.isEditing) R.string.activities_save_changes else R.string.activities_submit_proposal
            PrimaryButton(stringResource(label), actions.onSubmit, Modifier.fillMaxWidth(), loading = state.isSubmitting)
        }
    }
    ProposePickers(picker, form, onDismiss = { picker = null }, actions = actions)
}

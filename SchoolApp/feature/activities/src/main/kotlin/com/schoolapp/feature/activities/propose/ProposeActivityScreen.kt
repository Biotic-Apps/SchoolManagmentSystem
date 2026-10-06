package com.schoolapp.feature.activities.propose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.labelRes
import com.schoolapp.feature.activities.propose.components.LabeledSwitch
import com.schoolapp.feature.activities.propose.components.MultiSelectChips

/** Callbacks of the propose form, grouped to keep the screen signature readable. */
internal class ProposeActions(
    val onType: (ActivityType) -> Unit,
    val onTitle: (String) -> Unit,
    val onDescription: (String) -> Unit,
    val onDate: (String) -> Unit,
    val onStartTime: (String) -> Unit,
    val onEndTime: (String) -> Unit,
    val onVenue: (String) -> Unit,
    val onWholeBranch: (Boolean) -> Unit,
    val onSectionToggle: (String) -> Unit,
    val onRetrySections: () -> Unit,
    val onConsentRequired: (Boolean) -> Unit,
    val onDeadline: (String) -> Unit,
    val onSubmit: () -> Unit,
)


@Composable
internal fun ProposeActivityScreen(
    state: ProposeActivityUiState,
    actions: ProposeActions,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.activities_propose_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        if (state.submitted) {
            ScreenColumn(body) {
                item(key = "done") { InlineMessage(stringResource(R.string.activities_propose_sent), StatusTone.Success) }
                item(key = "back") { PrimaryButton(stringResource(R.string.activities_back_to_list), onBack) }
            }
        } else {
            ProposeFormContent(state, actions, body)
        }
    }
}

@Composable
private fun ProposeFormContent(state: ProposeActivityUiState, actions: ProposeActions, modifier: Modifier) {
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
                    onSelect = { actions.onType(ActivityType.valueOf(it)) },
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
            val error = when {
                ProposeField.DATE in errors -> stringResource(R.string.activities_error_date)
                ProposeField.DATE_PAST in errors -> stringResource(R.string.activities_error_date_past)
                else -> null
            }
            PickerField(formatDate(form.date).orEmpty(), stringResource(R.string.activities_field_date), { picker = ProposePicker.DATE }, errorText = error, enabled = enabled)
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
        item(key = "end") {
            val error = when {
                ProposeField.END_TIME in errors -> stringResource(R.string.activities_error_end_time)
                ProposeField.END_BEFORE_START in errors -> stringResource(R.string.activities_error_end_before_start)
                else -> null
            }
            PickerField(formatTime(form.endTime).orEmpty(), stringResource(R.string.activities_field_end_time), { picker = ProposePicker.END }, errorText = error, enabled = enabled, icon = Icons.Outlined.Schedule)
        }
        item(key = "venue") {
            AppTextField(form.venue, actions.onVenue, stringResource(R.string.activities_field_venue), enabled = enabled)
        }
        item(key = "audience") { AudienceSection(state, actions, enabled) }
        item(key = "consent") {
            LabeledSwitch(stringResource(R.string.activities_field_consent_required), form.consentRequired, actions.onConsentRequired, enabled = enabled)
        }
        if (form.consentRequired) {
            item(key = "deadline") {
                val error = when {
                    ProposeField.DEADLINE in errors -> stringResource(R.string.activities_error_deadline)
                    ProposeField.DEADLINE_AFTER_START in errors -> stringResource(R.string.activities_error_deadline_after_start)
                    else -> null
                }
                PickerField(formatDate(form.consentDeadline).orEmpty(), stringResource(R.string.activities_field_deadline), { picker = ProposePicker.DEADLINE }, errorText = error, enabled = enabled)
            }
        }
        item(key = "submit") { PrimaryButton(stringResource(R.string.activities_submit_proposal), actions.onSubmit, loading = state.isSubmitting) }
    }
    ProposePickers(picker, form, onDismiss = { picker = null }, actions = actions)
}

@Composable
private fun AudienceSection(state: ProposeActivityUiState, actions: ProposeActions, enabled: Boolean) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.activities_audience))
        FilterChipRow(
            options = listOf(
                SwitcherOption(WHOLE_BRANCH, stringResource(R.string.activities_audience_whole_branch)),
                SwitcherOption(SECTIONS, stringResource(R.string.activities_audience_sections)),
            ),
            selectedId = if (state.form.wholeBranch) WHOLE_BRANCH else SECTIONS,
            onSelect = { actions.onWholeBranch(it == WHOLE_BRANCH) },
        )
        if (!state.form.wholeBranch) {
            when {
                state.sectionsLoading -> LoadingState()
                state.sectionsError != null -> {
                    InlineMessage(appErrorMessage(state.sectionsError), StatusTone.Error)
                    SecondaryButton(stringResource(R.string.activities_retry), actions.onRetrySections)
                }
                state.sections.isEmpty() -> InlineMessage(stringResource(R.string.activities_no_sections), StatusTone.Info)
                else -> MultiSelectChips(state.sections, state.form.sectionIds, actions.onSectionToggle, enabled = enabled)
            }
            if (ProposeField.SECTIONS in state.errors) InlineMessage(stringResource(R.string.activities_error_sections), StatusTone.Error)
        }
    }
}

private const val WHOLE_BRANCH = "whole"
private const val SECTIONS = "sections"

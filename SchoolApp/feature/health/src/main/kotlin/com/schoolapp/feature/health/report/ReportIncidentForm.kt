package com.schoolapp.feature.health.report

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.components.incidentTypeLabel
import com.schoolapp.feature.health.components.severityLabel
import com.schoolapp.feature.health.components.studentSearchItems

@Immutable
internal class ReportIncidentCallbacks(
    val onQueryChange: (String) -> Unit,
    val onStudentPicked: (StudentSummary) -> Unit,
    val onChangeStudent: () -> Unit,
    val onDateChange: (String) -> Unit,
    val onTimeChange: (String) -> Unit,
    val onTypeChange: (IncidentType) -> Unit,
    val onSeverityChange: (IncidentSeverity) -> Unit,
    val onDescriptionChange: (String) -> Unit,
    val onActionTakenChange: (String) -> Unit,
    /** Picked content Uri (as string); uploaded by the ViewModel. */
    val onAttach: (String) -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun ReportIncidentForm(state: ReportIncidentUiState, callbacks: ReportIncidentCallbacks, modifier: Modifier = Modifier) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    var pickTime by rememberSaveable { mutableStateOf(false) }
    val enabled = !state.isSaving
    ScreenColumn(modifier) {
        item(key = "notice") { InlineMessage(stringResource(R.string.health_report_notice), StatusTone.Info) }
        state.error?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        item(key = "student_header") { SectionHeader(stringResource(R.string.health_student)) }
        if (state.studentId != null) {
            item(key = "student") { SelectedStudentCard(state, callbacks.onChangeStudent) }
        } else {
            if (IncidentField.STUDENT in state.errors) {
                item(key = "student_error") { InlineMessage(stringResource(R.string.health_student_required), StatusTone.Error) }
            }
            studentSearchItems(state.search, callbacks.onQueryChange, callbacks.onStudentPicked, hint = null)
        }
        item(key = "when") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                PickerField(
                    value = formatDate(state.date).orEmpty(),
                    label = stringResource(R.string.health_date),
                    onClick = { pickDate = true },
                    enabled = enabled,
                    modifier = Modifier.weight(1f),
                )
                PickerField(
                    value = formatTime(state.time).orEmpty(),
                    label = stringResource(R.string.health_time),
                    onClick = { pickTime = true },
                    enabled = enabled,
                    icon = Icons.Outlined.Schedule,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        if (IncidentField.FUTURE_TIME in state.errors) {
            item(key = "future") { InlineMessage(stringResource(R.string.health_future_error), StatusTone.Error) }
        }
        item(key = "type") {
            Column {
            SectionHeader(stringResource(R.string.health_type))
            FilterChipRow(
                options = IncidentType.entries.map { SwitcherOption(it.name, incidentTypeLabel(it)) },
                selectedId = state.type.name,
                onSelect = { callbacks.onTypeChange(IncidentType.valueOf(it)) },
            )
            }
        }
        item(key = "severity") {
            Column {
            SectionHeader(stringResource(R.string.health_severity))
            FilterChipRow(
                options = IncidentSeverity.entries.map { SwitcherOption(it.name, severityLabel(it)) },
                selectedId = state.severity.name,
                onSelect = { callbacks.onSeverityChange(IncidentSeverity.valueOf(it)) },
            )
            }
        }
        item(key = "description") {
            AppTextArea(
                value = state.description,
                onValueChange = callbacks.onDescriptionChange,
                label = stringResource(R.string.health_description),
                enabled = enabled,
                errorText = stringResource(R.string.health_required).takeIf { IncidentField.DESCRIPTION in state.errors },
            )
        }
        item(key = "action") {
            AppTextArea(
                value = state.actionTaken,
                onValueChange = callbacks.onActionTakenChange,
                label = stringResource(R.string.health_action_taken),
                enabled = enabled,
                errorText = stringResource(R.string.health_required).takeIf { IncidentField.ACTION_TAKEN in state.errors },
            )
        }
        item(key = "attachments") {
            AttachmentsField(
                draft = state.attachments,
                onPicked = callbacks.onAttach,
                onRemove = callbacks.onRemoveAttachment,
                label = stringResource(R.string.health_attachments),
                enabled = enabled,
            )
        }
        item(key = "submit") {
            PrimaryButton(
                stringResource(R.string.health_submit_report),
                callbacks.onSubmit,
                loading = state.isSaving,
                enabled = !state.attachments.isUploading,
            )
        }
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = state.date,
            maxDate = state.today,
            onConfirm = {
                pickDate = false
                callbacks.onDateChange(it)
            },
            onDismiss = { pickDate = false },
        )
    }
    if (pickTime) {
        AppTimePickerDialog(
            initialTime = state.time,
            title = stringResource(R.string.health_time_title),
            onConfirm = {
                pickTime = false
                callbacks.onTimeChange(it)
            },
            onDismiss = { pickTime = false },
        )
    }
}

@Composable
private fun SelectedStudentCard(state: ReportIncidentUiState, onChange: () -> Unit) {
    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            val name = state.studentName.orEmpty()
            PersonAvatar(name = name, photoUrl = null)
            Spacer(Modifier.width(12.dp))
            Text(
                name,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary,
            )
            if (!state.studentLocked) AppTextButton(stringResource(R.string.health_change_student), onChange)
        }
    }
}

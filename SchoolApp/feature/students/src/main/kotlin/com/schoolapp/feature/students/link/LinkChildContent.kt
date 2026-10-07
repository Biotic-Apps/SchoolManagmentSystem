package com.schoolapp.feature.students.link

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.people.GuardianRelation
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.students.R

@Immutable
class LinkChildCallbacks(
    val onAdmissionNoChange: (String) -> Unit,
    val onDobChange: (String) -> Unit,
    val onRelationChange: (GuardianRelation) -> Unit,
    val onCodeChange: (String) -> Unit,
    val onSendCode: () -> Unit,
    val onVerify: () -> Unit,
    val onDone: () -> Unit,
)

@Composable
fun LinkChildContent(state: LinkChildUiState, callbacks: LinkChildCallbacks, modifier: Modifier = Modifier) {
    ScreenColumn(modifier) {
        state.submitError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        when (state.step) {
            LinkStep.DETAILS -> item(key = "details") { DetailsStep(state, callbacks) }
            LinkStep.CODE -> item(key = "code") { CodeStep(state, callbacks) }
            LinkStep.DONE -> item(key = "done") {
                StepColumn {
                    InlineMessage(stringResource(R.string.students_link_done), StatusTone.Success)
                    PrimaryButton(stringResource(R.string.students_link_done_action), callbacks.onDone)
                }
            }
        }
    }
}

@Composable
private fun DetailsStep(state: LinkChildUiState, callbacks: LinkChildCallbacks) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    val relationLabels = stringArrayResource(R.array.students_relations)
    StepColumn {
        InlineMessage(stringResource(R.string.students_link_intro), StatusTone.Info)
        AppTextField(
            value = state.admissionNo,
            onValueChange = callbacks.onAdmissionNoChange,
            label = stringResource(R.string.students_link_admission),
            enabled = !state.isSubmitting,
            errorText = state.errors.firstMessage(LinkFieldError.ADMISSION_REQUIRED),
            kind = FieldKind.Code,
            imeAction = ImeAction.Done,
        )
        PickerField(
            value = formatDate(state.dob).orEmpty(),
            label = stringResource(R.string.students_link_dob),
            onClick = { pickDate = true },
            enabled = !state.isSubmitting,
            errorText = state.errors.firstMessage(LinkFieldError.DOB_REQUIRED, LinkFieldError.DOB_IN_FUTURE),
        )
        SectionHeader(title = stringResource(R.string.students_link_relation))
        FilterChipRow(
            options = GuardianRelation.entries.mapIndexed { i, r -> SwitcherOption(r.name, relationLabels.getOrElse(i) { r.name }) },
            selectedId = state.relation?.name,
            onSelect = { callbacks.onRelationChange(GuardianRelation.valueOf(it)) },
        )
        state.errors.firstMessage(LinkFieldError.RELATION_REQUIRED)?.let { InlineMessage(it, StatusTone.Error) }
        PrimaryButton(stringResource(R.string.students_link_send_code), callbacks.onSendCode, loading = state.isSubmitting)
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = state.dob,
            maxDate = state.today,
            onConfirm = {
                pickDate = false
                callbacks.onDobChange(it)
            },
            onDismiss = { pickDate = false },
        )
    }
}

@Composable
private fun CodeStep(state: LinkChildUiState, callbacks: LinkChildCallbacks) {
    val sentTo = state.maskedPhone?.let { stringResource(R.string.students_link_code_sent, it) }
        ?: stringResource(R.string.students_link_code_sent_generic)
    StepColumn {
        InlineMessage(sentTo, StatusTone.Info)
        state.devCode?.let { InlineMessage(stringResource(R.string.students_link_dev_code, it), StatusTone.Warning) }
        AppTextField(
            value = state.code,
            onValueChange = callbacks.onCodeChange,
            label = stringResource(R.string.students_link_code),
            enabled = !state.isSubmitting,
            errorText = state.errors.firstMessage(LinkFieldError.CODE_INVALID),
            kind = FieldKind.OneTimeCode,
            imeAction = ImeAction.Done,
            onImeAction = callbacks.onVerify,
        )
        PrimaryButton(stringResource(R.string.students_link_verify), callbacks.onVerify, loading = state.isSubmitting)
    }
}

@Composable
private fun StepColumn(content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
}

@Composable
private fun Set<LinkFieldError>.firstMessage(vararg candidates: LinkFieldError): String? =
    candidates.firstOrNull { it in this }?.let { stringResource(it.messageRes()) }

private fun LinkFieldError.messageRes(): Int = when (this) {
    LinkFieldError.ADMISSION_REQUIRED -> R.string.students_error_admission_required
    LinkFieldError.DOB_REQUIRED -> R.string.students_error_dob_required
    LinkFieldError.DOB_IN_FUTURE -> R.string.students_error_dob_future
    LinkFieldError.RELATION_REQUIRED -> R.string.students_error_relation_required
    LinkFieldError.CODE_INVALID -> R.string.students_error_code_invalid
}

@Preview(showBackground = true)
@Composable
private fun LinkChildContentPreview() = SchoolTheme {
    LinkChildContent(
        state = LinkChildUiState(today = "2026-10-05", admissionNo = "BS-2026-0012", dob = "2016-03-14"),
        callbacks = LinkChildCallbacks({}, {}, {}, {}, {}, {}, {}),
    )
}

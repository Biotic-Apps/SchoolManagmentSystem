package com.schoolapp.feature.admissions.enquiries

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.feature.admissions.R

/** "Add enquiry": saved for the user's branch and its active session. */
@Composable
internal fun EnquiryFormSheet(state: EnquiriesUiState, viewModel: EnquiriesViewModel) {
    val scope = state.scope
    AppBottomSheet(title = stringResource(R.string.admissions_add_enquiry), onDismiss = viewModel::dismissSheet) {
        when {
            scope == null -> LoadingState(rows = 2)
            scope.error != null -> ErrorState(appErrorMessage(scope.error), onRetry = viewModel::loadScope)
            scope.branchId == null || scope.sessionId == null ->
                InlineMessage(stringResource(R.string.admissions_new_no_session), StatusTone.Warning)
            else -> EnquiryFields(state, viewModel)
        }
    }
}

@Composable
private fun EnquiryFields(state: EnquiriesUiState, viewModel: EnquiriesViewModel) {
    val d = state.draft
    val p = state.draftProblems
    val required = stringResource(R.string.admissions_required)
    AppTextField(d.childName, { viewModel.onDraft(d.copy(childName = it.take(120))) }, stringResource(R.string.admissions_child_name),
        kind = FieldKind.Name, errorText = if (EnquiryField.CHILD_NAME in p) required else null)
    CreatablePickerField(
        label = stringResource(R.string.admissions_new_class),
        options = state.scope?.classes.orEmpty().map { PickerOption(it.id, it.name) },
        selectedId = d.classId,
        onSelect = { viewModel.onDraft(d.copy(classId = it)) },
        errorText = if (EnquiryField.CLASS in p) required else null,
    )
    DateField(stringResource(R.string.admissions_dob), d.dob, { viewModel.onDraft(d.copy(dob = it)) }, null, maxDate = today())
    AppTextField(d.guardianName, { viewModel.onDraft(d.copy(guardianName = it.take(100))) }, stringResource(R.string.admissions_guardian_name),
        kind = FieldKind.Name, errorText = if (EnquiryField.GUARDIAN_NAME in p) required else null)
    AppTextField(d.phone, { viewModel.onDraft(d.copy(phone = it.take(20))) }, stringResource(R.string.admissions_phone),
        kind = FieldKind.Phone, errorText = if (EnquiryField.PHONE in p) stringResource(R.string.admissions_phone_invalid) else null)
    AppTextField(d.email, { viewModel.onDraft(d.copy(email = it.take(254))) }, stringResource(R.string.admissions_email),
        kind = FieldKind.Email, supportingText = stringResource(R.string.admissions_new_optional),
        errorText = if (EnquiryField.EMAIL in p) stringResource(R.string.admissions_email_invalid) else null)
    AppTextField(d.source, { viewModel.onDraft(d.copy(source = it.take(EnquiryDraft.SOURCE_MAX))) }, stringResource(R.string.admissions_source),
        placeholder = stringResource(R.string.admissions_source_hint), supportingText = stringResource(R.string.admissions_new_optional))
    DateField(stringResource(R.string.admissions_follow_up_date), d.followUpDate, { viewModel.onDraft(d.copy(followUpDate = it)) }, null)
    AppTextArea(d.notes, { viewModel.onDraft(d.copy(notes = it.take(EnquiryDraft.NOTES_MAX))) }, stringResource(R.string.admissions_new_notes),
        supportingText = stringResource(R.string.admissions_new_optional), minLines = 2)
    state.actionError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
    PrimaryButton(stringResource(R.string.admissions_add_enquiry), viewModel::create, Modifier.fillMaxWidth(), loading = state.busy)
}

private fun today(): String = java.time.LocalDate.now().toString()

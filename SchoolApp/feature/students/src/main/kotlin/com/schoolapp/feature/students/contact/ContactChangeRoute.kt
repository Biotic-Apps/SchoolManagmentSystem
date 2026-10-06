package com.schoolapp.feature.students.contact

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R

@Composable
fun ContactChangeRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ContactChangeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.students_contact_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        ContactChangeForm(
            state = state,
            onPhoneChange = viewModel::onPhoneChange,
            onEmailChange = viewModel::onEmailChange,
            onAddressChange = viewModel::onAddressChange,
            onSubmit = viewModel::submit,
            modifier = Modifier.padding(padding),
        )
    }
}

@Composable
fun ContactChangeForm(
    state: ContactChangeUiState,
    onPhoneChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onAddressChange: (String) -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val editable = !state.isSubmitting && !state.sent
    ScreenColumn(modifier) {
        item { InlineMessage(stringResource(R.string.students_contact_hint), StatusTone.Info) }
        if (state.sent) item { InlineMessage(stringResource(R.string.students_contact_sent), StatusTone.Success) }
        state.submitError?.let { item { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        if (state.fieldError == ContactFieldError.EMPTY) {
            item { InlineMessage(stringResource(R.string.students_contact_empty), StatusTone.Warning) }
        }
        item {
            AppTextField(
                value = state.phone,
                onValueChange = onPhoneChange,
                label = stringResource(R.string.students_contact_phone),
                enabled = editable,
                errorText = if (state.fieldError == ContactFieldError.PHONE_INVALID) stringResource(R.string.students_contact_phone_invalid) else null,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            )
        }
        item {
            AppTextField(
                value = state.email,
                onValueChange = onEmailChange,
                label = stringResource(R.string.students_contact_email),
                enabled = editable,
                errorText = if (state.fieldError == ContactFieldError.EMAIL_INVALID) stringResource(R.string.students_contact_email_invalid) else null,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            )
        }
        item {
            AppTextArea(
                value = state.address,
                onValueChange = onAddressChange,
                label = stringResource(R.string.students_contact_address),
                enabled = editable,
            )
        }
        item {
            PrimaryButton(
                text = stringResource(R.string.students_contact_submit),
                onClick = onSubmit,
                enabled = editable,
                loading = state.isSubmitting,
            )
        }
    }
}

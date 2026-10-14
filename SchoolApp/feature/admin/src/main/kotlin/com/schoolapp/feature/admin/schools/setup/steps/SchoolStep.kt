package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.SetupUiState
import com.schoolapp.feature.admin.schools.setup.components.SetupPanel
import com.schoolapp.feature.admin.schools.setup.components.setupErrorText
import com.schoolapp.feature.admin.schools.setup.model.SetupKeys

@Composable
internal fun SchoolStep(state: SetupUiState, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    val school = state.form.school
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        SetupPanel(stringResource(R.string.setup_panel_school), description = stringResource(R.string.setup_panel_school_desc)) {
            AppTextField(
                value = school.name,
                onValueChange = edits::schoolName,
                label = stringResource(R.string.setup_school_name),
                placeholder = stringResource(R.string.setup_school_name_hint),
                errorText = setupErrorText(state.error(SetupKeys.SCHOOL_NAME)),
                kind = FieldKind.Title,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = school.code,
                onValueChange = edits::schoolCode,
                label = stringResource(R.string.setup_school_code),
                supportingText = stringResource(R.string.setup_school_code_hint),
                errorText = setupErrorText(state.error(SetupKeys.SCHOOL_CODE)),
                kind = FieldKind.Code,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        SetupPanel(stringResource(R.string.setup_panel_contact), description = stringResource(R.string.setup_panel_contact_desc)) {
            AppTextField(
                value = school.phone,
                onValueChange = { v -> edits.school { it.copy(phone = v) } },
                label = stringResource(R.string.setup_phone),
                placeholder = "+92 42 1234567",
                errorText = setupErrorText(state.error(SetupKeys.SCHOOL_PHONE)),
                kind = FieldKind.Phone,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = school.email,
                onValueChange = { v -> edits.school { it.copy(email = v) } },
                label = stringResource(R.string.setup_email),
                placeholder = "office@school.edu.pk",
                errorText = setupErrorText(state.error(SetupKeys.SCHOOL_EMAIL)),
                kind = FieldKind.Email,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = school.website,
                onValueChange = { v -> edits.school { it.copy(website = v) } },
                label = stringResource(R.string.setup_website),
                placeholder = "https://",
                errorText = setupErrorText(state.error(SetupKeys.SCHOOL_WEBSITE)),
                kind = FieldKind.Uri,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextArea(
                value = school.address,
                onValueChange = { v -> edits.school { it.copy(address = v) } },
                label = stringResource(R.string.setup_address),
                errorText = setupErrorText(state.error(SetupKeys.SCHOOL_ADDRESS)),
                minLines = 2,
                maxLines = 4,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

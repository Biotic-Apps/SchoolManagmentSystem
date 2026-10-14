package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.SetupUiState
import com.schoolapp.feature.admin.schools.setup.components.DateField
import com.schoolapp.feature.admin.schools.setup.components.SetupPanel
import com.schoolapp.feature.admin.schools.setup.components.setupErrorText
import com.schoolapp.feature.admin.schools.setup.model.SetupKeys

/** Principal sign-in and the academic year (web PeopleStep: PrincipalFields + AcademicsFields). */
@Composable
internal fun PeopleStep(state: SetupUiState, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    val principal = state.form.principal
    val academics = state.form.academics
    @Composable
    fun err(key: String) = setupErrorText(state.error(key))
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        SetupPanel(stringResource(R.string.setup_panel_principal), description = stringResource(R.string.setup_panel_principal_desc)) {
            AppTextField(
                value = principal.name,
                onValueChange = { v -> edits.principal { it.copy(name = v) } },
                label = stringResource(R.string.setup_full_name),
                errorText = err(SetupKeys.PRINCIPAL_NAME),
                kind = FieldKind.Name,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = principal.email,
                onValueChange = { v -> edits.principal { it.copy(email = v) } },
                label = stringResource(R.string.setup_email),
                placeholder = "name@school.edu.pk",
                errorText = err(SetupKeys.PRINCIPAL_EMAIL),
                kind = FieldKind.Email,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = principal.phone,
                onValueChange = { v -> edits.principal { it.copy(phone = v) } },
                label = stringResource(R.string.setup_phone),
                placeholder = "+92 300 1234567",
                errorText = err(SetupKeys.PRINCIPAL_PHONE),
                kind = FieldKind.Phone,
                modifier = Modifier.fillMaxWidth(),
            )
            SwitchRow(
                title = stringResource(R.string.setup_generate_password),
                supporting = stringResource(R.string.setup_generate_password_hint),
                checked = principal.generatePassword,
                onCheckedChange = { v -> edits.principal { it.copy(generatePassword = v) } },
            )
            if (!principal.generatePassword) {
                PasswordField(
                    value = principal.password,
                    onValueChange = { v -> edits.principal { it.copy(password = v) } },
                    label = stringResource(R.string.setup_password),
                    errorText = err(SetupKeys.PRINCIPAL_PASSWORD),
                    kind = FieldKind.NewPassword,
                    modifier = Modifier.fillMaxWidth(),
                )
                Text(stringResource(R.string.setup_password_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        SetupPanel(stringResource(R.string.setup_panel_year), description = stringResource(R.string.setup_panel_year_desc)) {
            SwitchRow(
                title = stringResource(R.string.setup_create_session),
                checked = academics.createSession,
                onCheckedChange = edits::createSession,
            )
            if (academics.createSession) {
                DateField(
                    stringResource(R.string.setup_starts_on), academics.startDate, { edits.sessionDates(it, academics.endDate) },
                    Modifier.fillMaxWidth(), error = err(SetupKeys.START_DATE),
                )
                DateField(
                    stringResource(R.string.setup_ends_on), academics.endDate, { edits.sessionDates(academics.startDate, it) },
                    Modifier.fillMaxWidth(), error = err(SetupKeys.END_DATE),
                )
                AppTextField(
                    value = academics.sessionName,
                    onValueChange = edits::sessionName,
                    label = stringResource(R.string.setup_session_name),
                    supportingText = stringResource(R.string.setup_session_name_hint),
                    errorText = err(SetupKeys.SESSION_NAME),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

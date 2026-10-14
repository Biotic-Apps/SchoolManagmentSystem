package com.schoolapp.feature.admin.roles.editor

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.components.SchoolPickerField
import com.schoolapp.feature.admin.roles.customRoleKeyPreview

/** Role name (with the key it maps to) and, for a new role, the school it is limited to. */
@Composable
internal fun RoleDetailsCard(
    state: RoleEditorUiState,
    onNameChange: (String) -> Unit,
    onSchoolChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val keyHint = state.role?.let { stringResource(R.string.roles_key_fixed, it.key) }
        ?: stringResource(R.string.roles_key_preview, customRoleKeyPreview(state.name))
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        AppTextField(
            value = state.name,
            onValueChange = onNameChange,
            label = stringResource(R.string.roles_name_label),
            enabled = state.rights.name,
            errorText = state.nameError?.let { stringResource(it) } ?: state.nameServerError,
            supportingText = keyHint,
            modifier = Modifier.fillMaxWidth(),
        )
        if (state.showSchool) {
            SchoolPickerField(
                schools = state.schools,
                selectedId = state.schoolId,
                allowGlobal = state.allowGlobal,
                onSelect = onSchoolChange,
                modifier = Modifier.fillMaxWidth(),
            )
            Text(stringResource(R.string.roles_school_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

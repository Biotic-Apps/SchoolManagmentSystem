package com.schoolapp.feature.admin.users.assignments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.OptionPickerField
import com.schoolapp.feature.admin.users.components.roleKeyLabel

/** Role, "Applies to", school / branch and optional end date for one assignment (create user + assign role). */
@Composable
internal fun AssignmentFields(
    draft: AssignmentDraft,
    options: AssignmentOptions,
    problems: Set<AssignmentProblem>,
    onChange: (AssignmentDraft) -> Unit,
    tomorrow: String,
    modifier: Modifier = Modifier,
) {
    val roleOptions = options.systemRoles.map { SwitcherOption(it.key, roleKeyLabel(it.key)) } +
        options.customRoles.map { SwitcherOption(it.key, it.name) }
    val scopes = options.scopesFor(draft.roleKey)
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OptionPickerField(
            label = stringResource(R.string.users_field_role),
            options = roleOptions,
            selectedId = draft.roleKey.ifBlank { null },
            onSelect = { onChange(draft.withRole(it, options)) },
            errorText = stringResource(R.string.users_error_pick_role).takeIf { AssignmentProblem.PICK_ROLE in problems },
            modifier = Modifier.fillMaxWidth(),
        )
        if (scopes.size > 1) {
            OptionPickerField(
                label = stringResource(R.string.users_field_applies_to),
                options = scopes.map { SwitcherOption(it, scopeName(it)) },
                selectedId = draft.scopeType,
                onSelect = { onChange(draft.copy(scopeType = it)) },
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (draft.scopeType == AssignmentOptions.SCOPE_SCHOOL) {
            OptionPickerField(
                label = stringResource(R.string.users_field_school),
                options = options.schools.map { SwitcherOption(it.id, it.name) },
                selectedId = draft.schoolId.ifBlank { null },
                onSelect = { onChange(draft.copy(schoolId = it)) },
                errorText = stringResource(R.string.users_error_pick_school).takeIf { AssignmentProblem.PICK_SCHOOL in problems },
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (draft.scopeType == AssignmentOptions.SCOPE_BRANCH) {
            OptionPickerField(
                label = stringResource(R.string.users_field_branch),
                options = options.branches.map { SwitcherOption(it.id, it.name) },
                selectedId = draft.branchId.ifBlank { null },
                onSelect = { onChange(draft.copy(branchId = it)) },
                errorText = stringResource(R.string.users_error_pick_branch).takeIf { AssignmentProblem.PICK_BRANCH in problems },
                modifier = Modifier.fillMaxWidth(),
            )
        }
        ValidUntilField(draft, problems, onChange, tomorrow)
    }
}

@Composable
private fun ValidUntilField(draft: AssignmentDraft, problems: Set<AssignmentProblem>, onChange: (AssignmentDraft) -> Unit, tomorrow: String) {
    var picking by rememberSaveable { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            PickerField(
                value = formatDate(draft.validUntil).orEmpty(),
                label = stringResource(R.string.users_field_valid_until),
                onClick = { picking = true },
                icon = Icons.Outlined.Event,
                errorText = stringResource(R.string.users_error_past_date).takeIf { AssignmentProblem.PAST_DATE in problems },
                modifier = Modifier.weight(1f),
            )
            if (draft.validUntil.isNotBlank()) {
                AppTextButton(stringResource(R.string.users_clear), onClick = { onChange(draft.copy(validUntil = "")) })
            }
        }
        Text(stringResource(R.string.users_valid_until_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
    }
    if (picking) {
        AppDatePickerDialog(
            initialDate = draft.validUntil.ifBlank { tomorrow },
            onConfirm = {
                picking = false
                onChange(draft.copy(validUntil = it))
            },
            onDismiss = { picking = false },
            minDate = tomorrow,
        )
    }
}

@Composable
private fun scopeName(scope: String): String = when (scope) {
    AssignmentOptions.SCOPE_GLOBAL -> stringResource(R.string.users_scope_global)
    AssignmentOptions.SCOPE_SCHOOL -> stringResource(R.string.users_scope_school)
    else -> stringResource(R.string.users_scope_branch)
}

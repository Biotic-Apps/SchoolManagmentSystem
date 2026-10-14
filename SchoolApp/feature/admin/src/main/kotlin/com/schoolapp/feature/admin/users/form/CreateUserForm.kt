package com.schoolapp.feature.admin.users.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PasswordField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.common.fieldProblemText
import com.schoolapp.feature.admin.users.assignments.AssignmentDraft
import com.schoolapp.feature.admin.users.assignments.AssignmentFields
import com.schoolapp.feature.admin.users.assignments.tomorrow

internal data class CreateUserActions(
    val onContactChange: (UserContact) -> Unit,
    val onPasswordChange: (String) -> Unit,
    val onAssignmentChange: (AssignmentDraft) -> Unit,
    val onAddAssignment: () -> Unit,
    val onRemoveAssignment: (Long) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun CreateUserForm(state: CreateUserUiState, actions: CreateUserActions, modifier: Modifier = Modifier) {
    val firstDay = tomorrow()
    ScreenColumn(modifier, maxWidth = AdminFormMaxWidth) {
        item(key = "intro") {
            Text(stringResource(R.string.users_add_intro), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        item(key = "contact") {
            AppCard(Modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
                UserContactFields(state.contact, actions.onContactChange, state.errors, state.serverErrors)
                PasswordField(
                    value = state.password,
                    onValueChange = actions.onPasswordChange,
                    label = stringResource(R.string.users_field_password),
                    errorText = state.serverErrors[UserField.PASSWORD] ?: fieldProblemText(state.errors[UserField.PASSWORD]),
                    kind = FieldKind.NewPassword,
                    modifier = Modifier.fillMaxWidth(),
                )
                Text(stringResource(R.string.users_password_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        item(key = "roles_header") { SectionHeader(stringResource(R.string.users_roles_and_scope)) }
        itemsIndexed(state.assignments, key = { _, draft -> "assignment_${draft.key}" }) { index, draft ->
            AppCard(Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        stringResource(R.string.users_assignment_n, index + 1),
                        style = MaterialTheme.typography.labelLarge,
                        color = AppColors.TextSecondary,
                        modifier = Modifier.weight(1f),
                    )
                    if (state.assignments.size > 1) {
                        IconButton(onClick = { actions.onRemoveAssignment(draft.key) }) {
                            Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.users_remove_assignment, index + 1))
                        }
                    }
                }
                AssignmentFields(
                    draft = draft,
                    options = state.options,
                    problems = state.assignmentProblems[draft.key].orEmpty(),
                    onChange = actions.onAssignmentChange,
                    tomorrow = firstDay,
                )
            }
        }
        if (state.canAddAssignment) {
            item(key = "add_assignment") {
                SecondaryButton(
                    text = stringResource(R.string.users_add_another_role),
                    onClick = actions.onAddAssignment,
                    leadingIcon = Icons.Outlined.Add,
                )
            }
        }
        state.saveError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
        item(key = "submit") {
            Row(horizontalArrangement = Arrangement.End) {
                PrimaryButton(
                    text = stringResource(R.string.users_create),
                    onClick = actions.onSubmit,
                    loading = state.isSaving,
                    enabled = !state.isSaving,
                    leadingIcon = Icons.Outlined.PersonAdd,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
